import { userDocument } from "../models/user.model";

declare global {
    namespace Express {
        interface User extends userDocument {
            _id?: any;
        }
    }
}
