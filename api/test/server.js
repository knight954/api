const express=require('express');
const app=express();
app.use(express.json());
let books=[
    {id:1,title:"harry potter"},
    {id:2,title:"alan"},
    {id:3,title:"hello"}];
app.get('/api/books',(req,res)=>{
    res.send(books);
});
app.get('/api/books/:id',(req,res)=>{
    let book=books.find(b=>b.id==req.params.id);
    res.send(book || 'Book not found');
});
app.post('/api/books',(req,res)=>{
    let book={id:books.length+1,title:req.body.title};
    books.push(book);
    res.send(book);
});
app.put('/api/books/:id',(req,res)=>{
    let book=books.find(b=>b.id==req.params.id);
    if(!book) return res.send("Book not found");
    book.title=req.body.title;
    res.send(book);
});
app.delete('/api/books/:id',(req,res)=>{
     books=books.filter(b=>b.id!=req.params.id);
    res.send(books);
});
app.listen(8080,()=>console.log("server running on port 8080"));

