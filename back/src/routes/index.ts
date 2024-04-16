import compose from "koa-compose";
import login from "./login";
import account from "./account";
export default compose([
  login.routes(),
  login.allowedMethods(),
  account.routes(),
  account.allowedMethods,
]);
