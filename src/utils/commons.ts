export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}
export const enumToPrismaArray = (enumObj: { [key: string]: string | number }) => {
  return Object.keys(enumObj).filter((key) => isNaN(Number(key)))
}
