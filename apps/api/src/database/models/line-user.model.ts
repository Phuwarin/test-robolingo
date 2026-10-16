import { CreatedAt, UpdatedAt, Table, Column, Model, DataType, PrimaryKey, HasMany } from "sequelize-typescript";
import { Message } from "./message.model.js";
@Table({ tableName: "line_users", timestamps: true })
export class LineUser extends Model {
  @PrimaryKey @Column(DataType.TEXT) declare id: string;
  @Column({ type: DataType.TEXT, allowNull: false }) declare name: string;
  @Column(DataType.TEXT) declare picture_url: string | null;
  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "unknown" }) declare friend_status: string;
  @Column(DataType.DATE) declare friend_status_at: Date | null;
  @Column(DataType.DATE) declare followed_at: Date | null;
  @CreatedAt @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW }) declare created_at: Date;
  @UpdatedAt @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW }) declare updated_at: Date;
  @HasMany(() => Message) declare messages: Message[];
}
