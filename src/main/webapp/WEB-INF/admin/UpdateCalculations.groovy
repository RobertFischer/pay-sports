
def subscriberFees = DAO.subscriberFees
def rightsFees = DAO.rightsFees

if(subscriberFees == null || rightsFees == null || subscriberFees.isEmpty() || rightsFees.isEmpty()) {
  Response.sendUnavailableError(response, "Could not retrieve stored data")
  return
}


