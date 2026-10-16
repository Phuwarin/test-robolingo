import { CreatedAt, UpdatedAt, Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { LineUser } from "./line-user.model.js";
@Table({
  tableName: "messages",
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ["line_user_id", "created_at"],
    },
  ],
})
export class Message extends Model {
  @PrimaryKey
  @Column(DataType.TEXT)
  declare id: string;

  @ForeignKey(() => LineUser)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare lineUserId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare direction: "received" | "botSent";

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare body: string;

  // Timestamps
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;

  // Relations
  @BelongsTo(() => LineUser)
  declare user: NonAttribute<LineUser>;
}
