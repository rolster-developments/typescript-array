type EachCallback = <T>(element: T, index: number) => Undefined<boolean>;
type EachError = <T>(element: T, index: number) => void;

interface ArrayEachOptions<T> {
  array: T[];
  each: EachCallback;
  catchError?: EachError;
}

interface MapOptions<E, V> {
  factory: (element: E) => V;
  identifier: (element: E) => string;
  reducer: (element: E, currentValue: V) => void;
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

export function firstElement<T>(array: T[]): Nulleable<T> {
  return array.length === 0 ? null : array[0];
}

export function lastElement<T>(array: T[]): Nulleable<T> {
  return array.length === 0 ? null : array[array.length - 1];
}

export function pushElement<T>(array: T[], element: T): T[] {
  return [...array, element];
}

export function replaceElement<T>(
  array: T[],
  element: T,
  criteria: (element: T) => boolean
): T[] {
  return array.map((currentElement) =>
    criteria(currentElement) ? element : currentElement
  );
}

export function removeElement<T>(
  array: T[],
  criteria: (element: T) => boolean
): T[] {
  return array.filter((currentElement) => !criteria(currentElement));
}

export function removeIndex<T>(array: T[], index: number): T[] {
  return array.filter((_, currentIndex) => index !== currentIndex);
}

export function arrayEach<T>(options: ArrayEachOptions<T>): boolean {
  const { array, each: each, catchError: stop } = options;

  try {
    array.forEach((element, index) => {
      if (each(element, index)) {
        throw new ForEachBreakException(element, index);
      }
    });

    return true;
  } catch (error) {
    if (stop && error instanceof ForEachBreakException) {
      const { element, index } = error;

      stop(element, index);
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
  const { factory, identifier, reducer } = options;

  const collection = new Map<string, V>();

  function currentValue(element: E): V {
    const resultId = identifier(element);

    const value = collection.get(resultId);

    if (value) {
      return value;
    }

    const newValue = factory(element);

    collection.set(resultId, newValue);

    return newValue;
  }

  array.forEach((element) => {
    reducer(element, currentValue(element));
  });

  return Array.from(collection.entries()).map(([_, value]) => value);
}
