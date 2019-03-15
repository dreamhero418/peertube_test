import { AllowNull, BelongsTo, Column, CreatedAt, ForeignKey, IsInt, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { VideoModel } from '../video/video'
import { UserModel } from './user'
import { Transaction, Op, DestroyOptions } from 'sequelize'

@Table({
  tableName: 'userVideoHistory',
  indexes: [
    {
      fields: [ 'userId', 'videoId' ],
      unique: true
    },
    {
      fields: [ 'userId' ]
    },
    {
      fields: [ 'videoId' ]
    }
  ]
})
export class UserVideoHistoryModel extends Model<UserVideoHistoryModel> {
  
  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @AllowNull(false)
  @IsInt
  @Column
  currentTime: number

  @ForeignKey(() => VideoModel)
  @Column
  videoId: number

  @AllowNull(false)
  @IsInt
  @Column
  seeded: number

  @BelongsTo(() => VideoModel, {
    foreignKey: {
      allowNull: false
    },
    onDelete: 'CASCADE'
  })
  Video: VideoModel

  @ForeignKey(() => UserModel)
  @Column
  userId: number

  @BelongsTo(() => UserModel, {
    foreignKey: {
      allowNull: false
    },
    onDelete: 'CASCADE'
  })
  User: UserModel

  static listForApi (user: UserModel, start: number, count: number) {
    return VideoModel.listForApi({
      start,
      count,
      sort: '-UserVideoHistories.updatedAt',
      nsfw: null, // All
      includeLocalVideos: true,
      withFiles: false,
      user,
      historyOfUser: user
    })
  }

  static async gettingUserSeedMB(userid:number){
    let mb = 0
    const query = {
      where: {
        userId: userid
      }
    }
    return await new Promise((resolve, reject) => {
      UserVideoHistoryModel.findAndCountAll(query)
      .then(({ rows, count }) => {   

        for (let i=0;i<rows.length;i++){
          mb += rows[i].dataValues.seeded
        }     
        
       resolve(mb)
      })  
    })
    
  }

  static async gettingVideoSeedMB(videoid:number){
    let mb = 0
    const query = {
      where: {
        videoId: videoid
      }
    }
    return await new Promise((resolve, reject) => {
      UserVideoHistoryModel.findAndCountAll(query)
      .then(({ rows, count }) => {   

        for (let i=0;i<rows.length;i++){
          mb += rows[i].dataValues.seeded
        }     
        
       resolve(mb)
      })  
    })
  }

  static removeHistoryBefore (user: UserModel, beforeDate: string, t: Transaction) {
    const query: DestroyOptions = {
      where: {
        userId: user.id
      },
      transaction: t
    }

    if (beforeDate) {
      query.where.updatedAt = {
        [Op.lt]: beforeDate
      }
    }

    return UserVideoHistoryModel.destroy(query)
  }
}

