import { nanoid } from 'nanoid';

export const uuid = () => {
  console.log('nanoid', nanoid());
  const id = nanoid();
  return id;
};

export const generateRandomCode = () => {
  return Math.floor(Math.random() * 9000) + 1000;
};
// export const uuid = () => {
//   return String(Math.floor(Math.random() * 9000) + 1000);
// };
