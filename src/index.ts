type EachCallback = <T>(element: T, index: number) => Undefined<boolean>;
type EachError = <T>(element: T, index: number) => void;

interface ArrayEachOptions<T> {
  array: T[];
  fnEach: EachCallback;
  catchError?: EachError;
}

interface MapOptions<E, V> {
  elementToValue: (element: E) => V;
  identifier: (element: E) => string;
  reducer: (element: E, value: V) => void;
}

type Reducer<T, V> = (value: T) => V;

class ForEachBreakException<T> extends Error {
  constructor(
    public readonly element: T,
    public readonly index: number
  ) {
    super('ForEach Exception');
  }
}

export function inArray<T>(array: T[], element: T): boolean {
  return array.indexOf(element) !== -1;
}

export function first<T>(array: T[]): Nulleable<T> {
  return array.length === 0 ? null : array[0];
}

export function last<T>(array: T[]): Nulleable<T> {
  return array.length === 0 ? null : array[array.length - 1];
}

export function push<T>(array: T[], element: T): T[] {
  return [...array, element];
}

export function refresh<T>(
  array: T[],
  element: T,
  criteria: (element: T) => boolean
): T[] {
  return array.map((currentElement) =>
    criteria(currentElement) ? element : currentElement
  );
}

export function destroy<T>(array: T[], criteria: (element: T) => boolean): T[] {
  return array.filter((currentElement) => !criteria(currentElement));
}

export function remove<T>(array: T[], index: number): T[] {
  return array.filter((_, currentIndex) => index !== currentIndex);
}

export function each<T>(options: ArrayEachOptions<T>): boolean {
  const { array, fnEach, catchError } = options;

  try {
    array.forEach((element, index) => {
      if (fnEach(element, index)) {
        throw new ForEachBreakException(element, index);
      }
    });

    return true;
  } catch (error) {
    if (catchError && error instanceof ForEachBreakException) {
      catchError(error.element, error.index);
    }

    return false;
  }
}

export function reduceDistinct<T, V>(array: T[], reducer: Reducer<T, V>): V[] {
  return array.reduce((result: V[], element) => {
    const value = reducer(element);

    if (!result.includes(value)) {
      result.push(value);
    }

    return result;
  }, []);
}

export function mapToReduce<E, V>(array: E[], options: MapOptions<E, V>): V[] {
  const collection = new Map<string, V>();

  function currentValue(element: E): V {
    const resultId = options.identifier(element);

    let value = collection.get(resultId);

    if (!value) {
      value = options.elementToValue(element);
      collection.set(resultId, value);
    }

    return value;
  }

  array.forEach((element) => {
    options.reducer(element, currentValue(element));
  });

  return Array.from(collection.entries()).map(([_, value]) => value);
}
