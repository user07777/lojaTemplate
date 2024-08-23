const { MongoClient , ObjectId } = require('mongodb');
const client = new MongoClient('mongodb://127.0.0.1:27017');
const CryptoJS = require('crypto-js');
ips=[""]

 Md5=(str,salt)=>{
  return CryptoJS.MD5(str+salt).toString(CryptoJS.enc.Hex);
}



async function login(user="",pass="",ip) {

  await client.connect();
  const db = client.db("loja");
  const collection = db.collection('usuarios');
  const result = await collection.findOne({ email: user, password: Md5(pass,"LOJA0xdeadbeef") });
  if (result) {
      if(result.LastIp!=ip){
        // sendMail()
        //confirm on mail

      }
      return {id:result._id.toString(),status:true}; 
  } else {
      return "Nome de usuário ou senha incorretos.";
  }

}
async function usrData(user = "", ip = "") {
  try {
    await client.connect();
    const db = client.db("loja");
    const collection = db.collection('usuarios');

    const result = await collection.findOne({ _id: new ObjectId(user.toString()) });
    if (result) {
      return result;
    } else {
      return "Null";
    }
  } catch (err) {
    return "Error";
  } finally {
    await client.close(); 
  }
}

async function IpByTkn(user){
  try {
    await client.connect();
    const db = client.db("loja");
    const collection = db.collection('usuarios');

    const result = await collection.findOne({ _id: new ObjectId(user.toString()) });
    if (result) {
      return result.ip;
    } else {
      return "Null";
    }
  } catch (err) {
    return "Error";
  } finally {
    await client.close(); 
  }
}




async function updtUsr(id, data) {
  try {
    await client.connect();
    const db = client.db("loja");
    const collection = db.collection('usuarios');

    const filter = { _id: new ObjectId(id.toString()) };
    const updateDoc = {
      $set: {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        address: {
          country: data.country,
          uf: data.uf,
          cep: data.cep,
          rua: data.rua,
          num: data.num,
          bairro: data.bairro,
          city: data.city,
        },
        tel: data.tel
      }
    };

    const result = await collection.updateOne(filter, updateDoc);
    
    if (result.matchedCount === 0) {
      return "can't find user";
    } else {
      return "ok";
    }
  } catch (err) {
    console.error("Error updating user:", err);
    return "Error";
  } finally {
    await client.close(); 
  }
}

async function getData(query="{}",type="") {
  await client.connect();
  const db = client.db("loja");
  const collection = db.collection('produtos');
  result = await collection.findOne({ _id: new ObjectId ("66c5dcfc17fbcc6cb3269003") });

  try{
    if(query=="{}"){

      return result["categorys"]

    }else{
      if(type=="category"){
        let cats=[];
        result["categorys"].forEach(i => {
          i["subcat"].forEach(j => {
            cats.push(j)
          })
        })
        return cats.filter(x => x["name"] == query).map(x => x["products"]);
      }
    }
  }catch(err){
    console.log(err)
  }

}


module.exports =  {
  login,usrData,updtUsr,IpByTkn,getData
}