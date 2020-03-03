import {v4} from "uuid";
import {Arg, Mutation, Resolver} from "type-graphql";

import {redis} from "../../redis";
import {User} from "../../entity/User";
import {sendEmail} from "../utils/sendEmail";
import {forgotPasswordPrefix} from "../constants/redisPrefixes";

@Resolver()
export class ForgotPasswordResolver {

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string
    ): Promise<boolean> {
        const [user] = await User.find({ where: { email }, take: 1 });

        if (!user) {
            return true
        }

        const token = v4();
        await redis.set(forgotPasswordPrefix + token, user.id, "ex", 60*60*24); // 1 day expiration

        await sendEmail(user.email, `http://localhost:3000/user/change-password/${token}`);

        return true
    }

}