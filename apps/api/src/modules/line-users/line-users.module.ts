import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LineUser } from "../../database/models/index.js";
import { LineUsersController } from "./line-users.controller.js";
import { LineUsersService } from "./line-users.service.js";
@Module({
  imports: [SequelizeModule.forFeature([LineUser])],
  controllers: [LineUsersController],
  providers: [LineUsersService],
})
export class LineUsersModule {}
