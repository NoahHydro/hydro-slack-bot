var express = require('express')
var router = express.Router()

let balanceToEther = (weiBalance) => {
  return parseInt(weiBalance) / 1e18
}

router.get('/:address', function (req, res, next) {
  let address = req.params.address

  req.app.get('getBalanceEtherscan')(address, req.app.get('ETHERSCAN_API_KEY'))
    .then(async balance => {
      let etherBalance = balanceToEther(balance)
      if (etherBalance < 0.1) {
        await req.app.get('sendWebhook')(
          req.app.get('webhooks').noah,
          '@channel: ⚠️Low Balance Warning⚠️',
          [{
            'fallback': `The current balance of ${address} is *${etherBalance.toFixed(4)}* ETH`,
            'color': '#F1CC29',
            'title': address,
            'title_link': `https://etherscan.io/address/${address}`,
            'text': `Current balance: *${etherBalance.toFixed(4)}* ETH`,
            'ts': Math.floor(new Date() / 1000)
          }]
        )
      }
      res.sendStatus(200)
    })
    .catch(error => { console.log(error); next(error) })
})

module.exports = router
