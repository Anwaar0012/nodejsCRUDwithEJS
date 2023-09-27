const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs =require('fs');
const path = require('path');

// Image Upload
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads');
    },
    filename:function(req,file,cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname)
    }
})

var upload = multer({
    storage:storage
}).single('image'); // this is the name attribute of the file attribute

// insert a user into database route
// /add is the action attribute of the form
router.post('/add',upload,(req,res)=>{
    const user = new User({
        name:req.body.name,
        email:req.body.email,
        phone: req.body.phone,
        image:req.file.filename
    });
    // user.save();
    // user.save(function(err,result){
    //     if(err){
    //         res.json({message:err.message,type:"danger"})
    //     }else{
    //         req.session.message = {
    //             type:"success",
    //             message:"User added successfully"
    //         };
    //         res.redirect('/');
    //     }
    // })
    user.save()
  .then(result => {
    // Handle the successful save
    req.session.message = {
        type:"success",
        message:"User added successfully"
    };
    res.redirect('/');
  })
  .catch(err => {
    // Handle the error
    res.json({message:err.message,type:"danger"})
  });

})


// replicate it and make it for home
// router.get('/',(req,res)=>{
//     // res.send('Home Page')
//     res.render('index',{title:"Home Page"})
// })

// Get all user data from db model user
// mongoose v6 method
// router.get('/',(req,res)=>{
//     User.find().exec(function(err,users){
//         if(err){
//             res.json({message : err.message});
//         }else{
//             res.render("index",{
//                 title:"Home Page",
//                 users:users
//             })
//         }
//     });
// })
// mongoose after v6
router.get('/', async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render("index", {
        title: "Home Page",
        users: users
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  });

  // Edit a user route
  // router.get('/edit/:id',(req,res)=>{
  //   // first get the id from the url 
  //   let id = req.param.id;
  //   // now pass this id to our User Model
  //   User.findById(id,(err,user)=>{
  //     if(err){
  //       res.redirect('/');
  //     } else {
  //       if(user == null){
  //         res.redirect('/');
  //       }else{
  //         res.render('edit_user',{
  //           title:"Edit User",
  //           user:user
  //         })
  //       }
  //     }
  //   })
  // })

  // Edit a user route
router.get('/edit/:id', async (req, res) => {
  try {
    // first get the id from the url
    let id = req.params.id; // Change req.param.id to req.params.id

    // now pass this id to our User Model
    const user = await User.findById(id);

    if (user == null) {
      res.redirect('/');
    } else {
      res.render('edit_user', {
        title: 'Edit User',
        user: user,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// update a user rout 
// router.post('/update/:id',upload,(req,res)=>{
//  let id= req.params.id;
//  let new_image =""
//  if(req.file){
//   new_image=req.file.filename
//   try{
//     // already we make an input of type hidden and gave name attribute old_image
//     fs.unlinkSync('./uploads'+req.body.old_image)
//   }catch(err){
//     console.log(err);
//   }
//  }else{
//   new_image=req.body.old_image
//  }
//  User.findByIdAndUpdate(id,{
//   name:req.body.name,
//   email:req.body.email,
//   phone:req.body.phone,
//   image:req.body.new_image
//  },(err,result)=>{
//   if(err){
//     res.json({message:err.message,type:'danger'})
//   }else{
//     req.session.message = {
//       type:'success',
//       message:'User updated successfully'
//     }
//     res.redirect('/');
//   }
//  })
// })



// Edit a user route
router.post('/update/:id', upload, async (req, res) => {
  try {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
      new_image = req.file.filename;
      try {
        const filePath = path.join('./uploads', req.body.old_image);
        console.log('Deleting file at path:', filePath);
        await fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted successfully');
          }
        });
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    } else {
      new_image = req.body.old_image;
    }

    const result = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: new_image,
    });

    if (!result) {
      res.json({ message: 'User not found', type: 'danger' });
    } else {
      req.session.message = {
        type: 'success',
        message: 'User updated successfully',
      };
      res.redirect('/');
    }
  } catch (err) {
    console.error('Error in /update route:', err);
    res.json({ message: err.message, type: 'danger' });
  }
});


// Delete user route
// router.get('/delete/:id',(req,res)=>{
//   let id = req.params.id
//   // console.log(id)
//   // console.log(req)
//   User.findByIdAndRemove(id,(err,result)=>{
//     if(result.image!=''){
//       try {
//         fs.unlinkSync('./uploads'+result.image);
        
//       } catch (error) {
//         console.log(error.message)
//       }
//     }
//     if(err){
//       res.json({message:err.message})
//     }else{
//       req.session.message ={
//         type:'info',
//         message:"User delete successfully"
//       }
//       res.redirect('/');
//     }
//   })

// })

// Delete user route
// router.get('/delete/:id', (req, res) => {
//   let id = req.params.id;
//   // console.log(id)
//   // console.log(req)

//   User.findByIdAndRemove(id)
//     .then((result) => {
//       if (result.image !== '') {
//         try {
//           fs.unlinkSync('./uploads' + result.image);
//         } catch (error) {
//           console.log(error.message);
//         }
//       }

//       req.session.message = {
//         type: 'info',
//         message: 'User deleted successfully',
//       };

//       res.redirect('/');
//     })
//     .catch((err) => {
//       res.json({ message: err.message });
//     });
// });


router.get('/delete/:id', (req, res) => {
  let id = req.params.id;

  User.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        const filePath = './uploads/' + result.image;

        // Check if the file exists before attempting to delete
        if (fs.existsSync(filePath)) {
          try {
            // Attempt to delete the file
            fs.unlinkSync(filePath);
            console.log('File deleted:', filePath);
          } catch (error) {
            console.error('Error deleting file:', error.message);
          }
        } else {
          console.log('File not found:', filePath);
        }

        req.session.message = {
          type: 'info',
          message: 'User deleted successfully',
        };

        res.redirect('/');
      } else {
        console.log('User not found');
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch((err) => {
      console.error('Error deleting user:', err.message);
      res.status(500).json({ message: err.message });
    });
});

module.exports = router;






  

router.get('/add',(req,res)=>{
    // res.send('Home Page')
    res.render('add_user',{title:"Add User"})
})

module.exports = router