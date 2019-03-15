import * as express from 'express'
import { UserWatchingVideo } from '../../../../shared'
import { asyncMiddleware, asyncRetryTransactionMiddleware, authenticate, videoWatchingValidator } from '../../../middlewares'
import { UserVideoHistoryModel } from '../../../models/account/user-video-history'
import { UserModel } from '../../../models/account/user'
import { VideoModel } from '../../../models/video/video' 

const watchingRouter = express.Router()

watchingRouter.put('/:videoId/watching',
  authenticate,
  asyncMiddleware(videoWatchingValidator),
  asyncRetryTransactionMiddleware(userWatchVideo)
)

// ---------------------------------------------------------------------------

export {
  watchingRouter
}

// ---------------------------------------------------------------------------

async function userWatchVideo (req: express.Request, res: express.Response) {
  const user = res.locals.oauth.token.User as UserModel

  const body: UserWatchingVideo = req.body
  let { id: videoId } = res.locals.video as { id: number }
  
  await UserVideoHistoryModel.upsert({
    videoId,
    userId: user.id,
    currentTime: body.currentTime,
    seeded: body.downMb
  })

  let seededbyuser = await UserVideoHistoryModel.gettingUserSeedMB(user.id)
  let seededbyvideo = await UserVideoHistoryModel.gettingVideoSeedMB(videoId)
  console.log('**********'+'userid:'+user.username+'::'+seededbyuser+'MB*******************') 
  console.log('**********'+'videoid:'+videoId+'::'+seededbyvideo+'MB*******************')   

  await UserModel.update({ seededByUser: seededbyuser }, { where: { id: user.id }})
  await VideoModel.update({ seededByVideo:seededbyvideo }, { where: { id: videoId }})

  return res.type('json').status(204).end()
}