const tokenService = require('../helpers/jwt')
const { respondWithError } = require('../provider/error')
const logger = require('../logger')

async function simpleAuth(req, res, next) {
  const { providerName } = req.params

  try {
    const simpleAuthResponse = await req.companion.provider.simpleAuth({
      requestBody: req.body,
    })

    req.companion.providerUserSession = {
      ...req.companion.providerUserSession,
      ...simpleAuthResponse,
    }

    logger.debug(
      `Generating simple auth token for provider ${providerName}`,
      null,
      req.id,
    )
    const uppyAuthToken = tokenService.generateEncryptedAuthToken(
      { [providerName]: req.companion.providerUserSession },
      req.companion.options.secret,
      req.companion.providerClass.authStateExpiry,
    )

    tokenService.addToCookiesIfNeeded(
      req,
      res,
      uppyAuthToken,
      req.companion.providerClass.authStateExpiry,
    )

    res.send({ uppyAuthToken })
  } catch (err) {
    if (respondWithError(err, res)) return
    next(err)
  }
}

module.exports = simpleAuth
