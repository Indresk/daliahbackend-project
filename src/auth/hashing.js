import argon2 from 'argon2';

export async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(password, hashed) {
  return await argon2.verify(hashed, password);
}