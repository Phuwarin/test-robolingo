import { CreatedAt, UpdatedAt, Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { LineUser } from "./line-user.model.js";
@Table({ tableName: "messages", timestamps: true, indexes: [{ fields: ["line_user_id", "created_at"] }] })
export class Message extends Model {
  @PrimaryKey @Column(DataType.TEXT) declare id: string;
  @ForeignKey(() => LineUser) @Column({ type: DataType.TEXT, allowNull: false }) declare line_user_id: string;
  @Column({ type: DataType.TEXT, allowNull: false }) declare direction: "in" | "out";
  @Column({ type: DataType.TEXT, allowNull: false }) declare body: string;
  @CreatedAt @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW }) declare created_at: Date;
  @UpdatedAt @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW }) declare updated_at: Date;
  @BelongsTo(() => LineUser) declare user: NonAttribute<LineUser>;
}
