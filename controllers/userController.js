const User=require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const bcrypt=require("bcryptjs")
const crypto=require("crypto")
const AppError = require("../utils/appError")
const ExcelJS = require('exceljs');
const moment = require("moment");
const nodemailer = require('nodemailer');

//reset password
exports.resetPassword=catchAsync(async(req,res,next)=>{
    const {new_password,confirm_password}=req.body
    const token=req.body.token;
    // console.log(token)
        if(!new_password || !confirm_password){
          return next(
            new AppError("please filled the fields",
            400)
          )
        }else{
          const student=await User.findOne({
            resetToken:token,
          expireToken:{$gt:Date.now()}
        })
          if(!student){ 
            return next(
              new AppError("Token not verified",
              400)
            )  
          }else{
            const isMatch=await student.matchPassword(new_password)
            // console.log(`isMatch === ${isMatch}`)
            if(isMatch){
              return next(
                new AppError("old password is same as new password...please try another password",
                400)
              ) 
            }
            else{
              if(new_password===confirm_password){
                student.user_password=new_password
                student.resetToken=undefined;
                student.expireToken=undefined;
                await student.save()
                res.status(200).json({
                  status:"success",
                  message:"Reset Password Successfully"
                })
              }else{
                return next(
                  new AppError("New and confirm  password do not match",
                  400)
                ) 
              }
            }
          }
        }
          })              
//reset password link
exports.resetLink=catchAsync(async(req,res,next)=>{
  const {user_email}=req.body;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return next(
        new AppError(err,
        400)
      )
    } else {
      const token = buffer.toString("hex");
      const student = await User.findOne({ user_email });
      if(!student){
        return next(
          new AppError("no user registered with this email",
          400)
        )
      }else{
        student.resetToken=token;
        student.expireToken=Date.now()+360000;
        // console.log(student)
        await student.save({validateBeforeSave:false});
        
        var transport = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          auth: {
            user: process.env.EMAIL_USER,
            pass: "69a6d58a2bfe93"
          }
        });
        // console.log(process.env.EMAIL_PASS,process.env.EMAIL_PORT)
        const mailOption= {
          from:"zeeshanshabbeer2425@gmail.com",
          to:user_email,
          subject:"dnsafs",
          html: `
          <div
            style="
              text-align: center;
              background-color: rgb(255, 193, 122);
              margin-left: 00px;
              margin-right: 00px;
              padding-top: 1px;
              padding-bottom: 70px;
            "
          >
            <h2>CbSol</h2>
            <h4 style="margin-top: -20px">Attendance Management System</h4>
            <div>
              <div
                style="
                  background-color: rgb(255, 255, 255);
                  margin-left: 30px;
                  margin-right: 30px;
                  padding-top: 30px;
                  padding-bottom: 30px;
                  border-radius: 5px;
                "
              >
                <form action="">
                  <h3 style="display: inline">Hello</h3>
                  <h3 style="display: inline">${student.user_name},</h3>
                  <h2>Forgot your password?</h2>
                  <p style="font-size: 18px; padding-top: 10px">
                    That's okay, it happens! Click on the button <br />below to reset
                    your password.
                  </p>
                  <button
                    style="
                      background-color: white;
                      padding: 10px 10px 10px 10px;
                      border: none;
                      border-radius: 5px;
                      font-weight: bold;
                      margin-top: 10px;
                      color: white;
                    "
                  ><a href="http://localhost:000/Attendance/${token}">
                    RESET YOUR PASSWORD
                  </button>
                  <h4 style="margin-top: 40px; font-size: 15px">Regards,</h4>
                  <h4 style="margin-top: -20px; font-size: 15px">CbSol Team</h4>
                </form>
              </div>
            </div>
          </div>
                           
      `
        }
        transport.sendMail(mailOption);
      }
    }
  })
})
         
//teacher view profile of student
exports.viewProfile=catchAsync(async(req,res,next)=>{
  const role_name="Student"
  const profile=await User.find({role_name})
  if(!profile){
      return next(
          new AppError("no profile found",
          400)
        ) 
  }else{
    res.status(200).json({
      status:"success",
      message:profile
    })
  }
})
//teacher view specific student profile or search student 
exports.view_Specific_Profile=catchAsync(async(req,res,next)=>{
  const {user_id}=req.params
  // const {user_id}=req.params
  const profile=await User.findOne({user_id})
  if(!profile){
      return next(
          new AppError("no profile found",
          400)
        ) 
  }else{
    res.status(200).json({
      status:"success",
      message:profile
    })
  }
})
//Admin view  profiles
exports.Admin_viewProfile=catchAsync(async(req,res,next)=>{
  const profile=await User.find()
  if(!profile){
      return next(
          new AppError("no profile found",
          400)
        ) 
  }else{
    res.status(200).json({
      status:"success",
      message:profile
    })
  }
})
//admin view specific student and teacher profile
exports.Admin_view_Specific_Profile=catchAsync(async(req,res,next)=>{
  const {user_id}=req.params
  // const {user_id}=req.params
  const profile=await User.findOne({user_id})
  if(!profile){
      return next(
          new AppError("no profile found",
          400)
        ) 
  }else{
    res.status(200).json({
      status:"success",
      message:profile
    })
  }
})

//generate excel file
exports.sheet=catchAsync(async(req,res,next)=>{
  const startDate=moment(new Date()).startOf('month').toDate();
  const endDate=moment(new Date()).endOf('month').toDate();
//startdate and end date not working
//all the data get
  const users= await User.find({created_at:{
      $gte: startDate,$lte:endDate}
  })
  const workbook=new ExcelJS.Workbook()
  const worksheet= workbook.addWorksheet("User Data")
  //create column
  worksheet.columns=[
    {header:"S_no",key:"s_no",width:10},
    {header:"User Id",key:"user_id",width:10},
    {header:"Name",key:"user_name",width:20},
    {header:"Role",key:"role_name",width:10},
    {header:"Email",key:"user_Email",width:20},
    {header:"Address",key:"user_address",width:40},
    {header:"Contact no",key:"user_contactno",width:20},
    {header:"Username",key:"user_username",width:10},
  ]
  let count=1
  users.forEach(user=>{
    user.s_no=count;
    worksheet.addRow(user);
    count+=1;
    console.log(count)
  })
  console.log(users)
  worksheet.getRow(1).eachCell((cell)=>{
    cell.font={bold:true}
  })
  const data=await workbook.xlsx.writeFile('Registered_users.xlsx')
    res.send("done")
})
