import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Party } from '../party';
import { User } from '../user';
import { NotificationType } from './type';

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@Entity('notifications')
@ObjectType()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column('text')
  @Field(() => NotificationType)
  type: NotificationType;

  @ManyToOne(() => User, (user) => user.notifications)
  @Field(() => User)
  user: User;

  @ManyToOne(() => User)
  @Field(() => User)
  from: User;

  @ManyToOne(() => Party, { nullable: true })
  @Field(() => Party, { nullable: true })
  party?: Party;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;
}
