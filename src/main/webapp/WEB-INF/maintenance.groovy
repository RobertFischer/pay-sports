Response.sendUnavailableError

def message = null;
if(params.feature != null && params.status != null) {
  message = "${params.feature} is currently unreachable: ${params.status}"
}

Response.sendUnavailableError(response, message)
