import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import _ from "lodash";

import path, { parse } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import date,{getDay} from "./date.js";

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser: true});

const workSchema = new mongoose.Schema({
    toDo: {
        type: String,
        required: [true,"Please check your data entry, No data specified."]
    }
});

const Work = mongoose.model("Work",workSchema);

const work1 = new Work({
    toDo: "Go and make your Bed!"
});

const work2 = new Work({
    toDo: "Go and eat breakfast!"
});

const work3 = new Work({
    toDo: "Go and Study!"
});

const defaultArray = [work1, work2, work3];

const listSchema = {
    name: String,
    work: [workSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    Work.find().then((works) => {
        if(works.length===0){
            Work.insertMany(defaultArray);
            res.redirect("/");
        } else{
            res.render("list",{listTitle: "Today",newListItems: works});
        }
    });
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then((foundList) => {
        if(!foundList){
            console.log("Not exist! But Created now!");
            const list = new List({
                name: customListName,
                work: defaultArray
            });
        
            list.save();
            res.redirect("/"+customListName);
        } else{
            res.render("list",{listTitle: foundList.name,newListItems: foundList.work});
        }
    });
});

app.post("/",function(req,res){
    let item = req.body.NewItem;
    let listName = req.body.list;
    const work4 = new Work({
        toDo: item
    });
    if(listName==="Today"){
        work4.save();
        res.redirect("/");
    } else{
        List.findOne({name:listName}).then((foundList) => {
            foundList.work.push(work4);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.Checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Work.findByIdAndRemove(checkedItemId).then((err) => {
            if(!err){
                console.log(err);
            } else{
                console.log("Item deleted successfully!");
            }
            res.redirect("/");
        });
    } else{
        List.findOneAndUpdate({name:listName},{$pull:{work:{_id:checkedItemId}}}).then(() => {
            res.redirect("/"+listName);
        });
    }
});

app.listen(3000,function(){
    console.log("Server is running on port 3000.");
});