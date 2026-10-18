import { CreatedAt, UpdatedAt, Table, Column, Model, DataType, PrimaryKey, HasMany } from "sequelize-typescript";
import { Message } from "./message.model.js";
@Table({
  tableName: "line_users",
  timestamps: true,
  underscored: true,
})
export class LineUser extends Model {
  @PrimaryKey
  @Column(DataType.TEXT)
  declare id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare name: string;

  @Column(DataType.TEXT)
  declare pictureUrl: string | null;

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: "unknown" })
  declare friendStatus: string;

  @Column(DataType.DATE)
  declare friendStatusAt: Date | null;

  @Column(DataType.TEXT)
  declare lastMessageId: string | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare unreadCount: number;

  // Timestamps
  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare updatedAt: Date;

  // Relations
  @HasMany(() => Message)
  declare messages: Message[];
}
