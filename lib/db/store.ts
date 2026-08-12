import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * A tiny JSON-file datastore.
 *
 * **This is the local implementation of the persistence interface, not the
 * final one.** It exists so the admin panel is genuinely usable before
 * Supabase is introduced, and because §0 decision 2 requires the site to
 * render when the database is empty or unreachable — so a non-database source
 * has to exist regardless.
 *
 * Its one hard limitation is worth stating plainly: **serverless hosting has a
 * read-only filesystem.** Editing content in production requires the Supabase
 * implementation. Locally, and on any host with a writable disk, this works.
 *
 * Files live in `data/` and are plain JSON on purpose — reviewable in a diff,
 * and trivially importable into Postgres later.
 */
const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Serialises writes within this process.
 *
 * Two admin saves landing at once would otherwise interleave read-modify-write
 * and silently lose one of them. A promise chain is enough here; it is not a
 * cross-process lock, and does not need to be for a single local admin.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.catch(() => undefined);
  return result;
}

function filePath(collection: string): string {
  // Guard against a collection name escaping the data directory.
  if (!/^[a-z-]+$/.test(collection)) {
    throw new Error(`Invalid collection name: ${collection}`);
  }
  return path.join(DATA_DIR, `${collection}.json`);
}

/**
 * Thrown when the filesystem will not accept a write.
 *
 * On serverless hosting the application directory is read-only, so every
 * admin save fails there. That is a known limitation of this storage backend,
 * not a bug — but it has to surface as a clear message in the admin UI rather
 * than an unhandled 500, so the person clicking Save learns what happened.
 */
export class ReadOnlyStoreError extends Error {
  constructor() {
    super(
      "The filesystem is read-only, so content cannot be saved here. Editing works on a local or persistent-disk deployment; production content editing needs the Supabase backend.",
    );
    this.name = "ReadOnlyStoreError";
  }
}

/** Read-only filesystem, or no permission to write to it. */
function isReadOnlyError(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException).code;
  return code === "EROFS" || code === "EACCES" || code === "EPERM";
}

async function writeAtomically<T>(collection: string, value: T): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    const target = filePath(collection);
    const temporary = `${target}.${process.pid}.tmp`;

    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(temporary, target);
  } catch (error) {
    if (isReadOnlyError(error)) throw new ReadOnlyStoreError();
    throw error;
  }
}

export async function readCollection<T>(collection: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath(collection), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    // A missing file is the normal first-run state, not an error.
    if (code === "ENOENT") return fallback;
    // Corrupt JSON is worth surfacing rather than silently resetting content.
    if (error instanceof SyntaxError) {
      throw new Error(`data/${collection}.json is not valid JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Writes atomically: to a temporary file, then rename.
 *
 * A crash midway through a plain write leaves a truncated file and loses the
 * collection. Rename is atomic on the same filesystem, so a reader sees either
 * the old contents or the new ones.
 */
export async function writeCollection<T>(collection: string, value: T): Promise<void> {
  return enqueue(() => writeAtomically(collection, value));
}

/** Read-modify-write as one queued operation, so concurrent saves cannot race. */
export async function updateCollection<T>(
  collection: string,
  fallback: T,
  mutate: (current: T) => T,
): Promise<T> {
  return enqueue(async () => {
    const current = await readCollection(collection, fallback);
    const next = mutate(current);
    await writeAtomically(collection, next);
    return next;
  });
}
