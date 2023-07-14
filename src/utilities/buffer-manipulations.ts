const concatFilesContent = (contents: Uint8Array[]) => {
  // Could've returned [...acc, ...curr] in the reducer callback, it would look nice and clean,
  // but it would made a copy of the acc, which is less performant
  const newContent = contents.reduce((acc: number[], curr: Uint8Array) => {
    acc.push(...curr);
    return acc;
  }, []);

  return new Uint8Array(newContent);
};

export default concatFilesContent;
