import { isMainThread } from 'worker_threads';
import Solvers from '../solvers';
if (isMainThread) {
    console.log('Oy git, I\'m not supposed to be run directly...');
    process.exit(1);
}
console.log(Solvers);
