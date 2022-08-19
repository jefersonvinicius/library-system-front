type MoveProps = {
  from: number;
  to: number;
};

export function move<T>({ from, to }: MoveProps) {
  return (array: T[] | null) => {
    if (!array) return array;

    const copy = Array.from(array);
    const hold = array[from];
    copy.splice(from, 1);
    copy.splice(to, 0, hold);
    return copy;
  };
}
