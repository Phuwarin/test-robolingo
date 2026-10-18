import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, type WhereOptions } from "sequelize";
import { LineUser } from "../../database/models/index.js";
@Injectable()
export class LineUsersService {
  constructor(@InjectModel(LineUser) private readonly users: typeof LineUser) {}
  async list(query: string, status: string) {
    const where: WhereOptions = {
      ...(status ? { friendStatus: status } : {}),
      ...(query ? { [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }, { lineUserId: { [Op.iLike]: `%${query}%` } }] } : {}),
    };
    const users = await this.users.findAll({
      where,
      order: [
        ["updatedAt", "DESC"],
        ["id", "ASC"],
      ],
    });
    return {
      users,
      total: users.length,
    };
  }
}
