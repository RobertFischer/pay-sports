import static com.google.appengine.api.capabilities.Capability.*
import static com.google.appengine.api.capabilities.CapabilityStatus.*
// Add your routes here

get "/admin/update/carriage-fees", forward: {
  to("/admin/UpdateCarriageFees.groovy")
  [DATASTORE_WRITE,URL_FETCH].each { feature ->
    to("/maintenance.groovy?feature=${feature.name}&status=${capabilities.getStatus(feature)}").on(feature).not(ENABLED)
  }
}, validate: { users.isUserAdmin() }

get "/admin/update/rights-fees", forward: {
  to("/admin/UpdateRightsFees.groovy")
  [DATASTORE_WRITE,URL_FETCH].each { feature ->
    to("/maintenance.groovy?feature=${feature.name}&status=${capabilities.getStatus(feature)}").on(feature).not(ENABLED)
  }
}, validate: { users.isUserAdmin() }

get "/admin/update/carrier-channels", forward: {
  to("/admin/UpdateCarrierPackages.groovy")
  [DATASTORE_WRITE,URL_FETCH].each { feature ->
    to("/maintenance.groovy?feature=${feature.name}&status=${capabilities.getStatus(feature)}").on(feature).not(ENABLED)
  }
}, validate: { users.isUserAdmin() }

get "/admin/update/calculations", forward: {
  to("/admin/UpdateCalculations.groovy")
  [DATASTORE,BLOBSTORE].each { feature ->
    to("/maintenance.groovy?feature=${feature.name}&status=${capabilities.getStatus(feature)}").on(feature).not(ENABLED)
  }
}, validate: { users.isUserAdmin() }
