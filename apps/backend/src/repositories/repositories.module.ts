import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository.service';

@Global()
@Module({
  providers: [UserRepository],
  exports: [UserRepository],
})
export class RepositoriesModule {}
