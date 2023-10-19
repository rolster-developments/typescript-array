type CallEach = <T>(el: T, index: number) => Undefined<boolean>;
type CallStop = <T>(el: T, index: number) => void;

interface EachArray<T> {
  array: T[];
  each: CallEach;
  stop?: CallStop;
}

interface MapReduce<E, V> {
  identifier: (element: E) => string;
  factory: (element: E) => V;
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

export const inArray = <T>(array: T[], element: T): boolean => {
  return array.indexOf(element) !== -1;
};

export const firstElement = <T>(array: T[]): Nulleable<T> => {
  return array.length === 0 ? null : array[0];
};

export const lastElement = <T>(array: T[]): Nulleable<T> => {
  return array.length === 0 ? null : array[array.length - 1];
};

export const pushElement = <T>(array: T[], element: T): T[] => {
  return [...array, element];
};

export const updateElement = <T>(
  array: T[],
  element: T,
  reducer: (element: T) => boolean
): T[] => {
  return array.map((currentElement) =>
    reducer(currentElement) ? element : currentElement
  );
};

export const removeElement = <T>(
  array: T[],
  reducer: (element: T) => boolean
): T[] => {
  return array.filter((currentElement) => !reducer(currentElement));
};

export const removeIndex = <T>(array: T[], indexElement: number): T[] => {
  return array.filter((_, index) => indexElement !== index);
};

export const arrayEach = <T>(props: EachArray<T>): boolean => {
  const { array, each, stop } = props;

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
};

export const reduceDistinct = <T, V>(
  array: T[],
  reducer: Reducer<T, V>
): V[] => {
  return array.reduce((result: V[], element) => {
    const value = reducer(element);

    if (!result.includes(value)) {
      result.push(value);
    }

    return result;
  }, []);
};

export const mapToReduce = <E, V>(array: E[], props: MapReduce<E, V>): V[] => {
  const { factory, identifier, reducer } = props;

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
};
