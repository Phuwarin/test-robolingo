import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, type WhereOptions } from "sequelize";
import { LineUser } from "../../database/models/index.js";
@Injectable()
export class LineUsersService {
  constructor(@InjectModel(LineUser) private readonly users: typeof LineUser) {}
  async list(query: string, status: string, page: number, limit: number) {
    const where: WhereOptions = {
      ...(status ? { friendStatus: status } : {}),
      ...(query ? { [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }, { lineUserId: { [Op.iLike]: `%${query}%` } }] } : {}),
    };
    const { rows, count } = await this.users.findAndCountAll({
      where,
      order: [
        ["updatedAt", "DESC"],
        ["id", "ASC"],
      ],
      limit,
      offset: (page - 1) * limit,
    });
    return {
      users: rows,
      total: count,
      page,
      limit,
    };
  }
}
