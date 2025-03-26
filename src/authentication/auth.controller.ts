//authentication controller
import "dotenv/config";
import { Context } from "hono";
import { createAuthUserService, userLoginService } from "./auth.service";
import * as bycrpt from "bcrypt";
import { sign } from "hono/jwt";
import { users } from "../drizzle/schema";
 
export const registerUser = async (c: Context) => {
    try {
 
        console.log(await c.req.json())
        const user = await c.req.json();
        const pass = user.password;
        const hashedPassword = await bycrpt.hash(pass, 10);
        user.password = hashedPassword;
        const createdUser = await createAuthUserService(user);
        if (!createdUser) return c.text("User exit do you want to login?", 404);
        return c.json({ msg: createdUser }, 201);
 
    } catch (error: any) {
        return c.json({ error: error?.message }, 400)
    }
 
}
 
export const loginUser = async (c: Context) => {
 
    try {
        console.log("hey")
        const user = await c.req.json();
        //check user exist
        // console.log(user)
        const userExist = await userLoginService(user);
        // console.log(userExist)
        if (userExist === null) return c.json({ error: "User not found" }, 404);  // not found        
        const userMatch = await bycrpt.compare(user.password, userExist?.password as string);
        // console.log(userMatch)
        if (!userMatch) {
            return c.json({ error: "invalid login details!!!" }, 401);  // unauthorized
        } else {
            // create a payload
            const payload = {
                sub: userExist?.user,
 
                role: userExist?.role,
                exp: Math.floor(Date.now() / 1000) + (60 * 180)
                 // 3 hour  => SESSION EXPIRATION
            }
            // console.log(payload)
            console.log(process.env.JWT_SECRET)
            let secret = process.env.JWT_SECRET as string;  // secret key
            // console.log(secret); //
            const token = await sign(payload, secret);   // create a JWT token
            let user = userExist?.user;
            let role = userExist?.role;
            return c.json({ token, user: { role,user } }, 200);  // return token and user details
        }
    } catch (error: any) {
        return c.json({ error: error?.message }, 400)
    }
 
}
 
 
 