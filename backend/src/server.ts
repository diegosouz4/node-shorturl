import app from './app';
import dotenv from 'dotenv';
import { seedUsers } from './seeds/users.seed';

dotenv.config();

const PORT = process.env.PORT ?? 3000;

//Seeding users
// seedUsers.seedUsers();

console.clear();

app.listen(PORT, () => console.log(`Server listen port http://localhost:${PORT}`));