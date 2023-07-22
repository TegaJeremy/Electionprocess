const express = require ("express");
const mongoose = require ("mongoose")
const PORT =  2093;
const data = express();
data.use(express.json());


const stateschema=new mongoose.Schema(
 
  {     
         state:String,
         parties:[String],
         result:{
            apc: Number,  
            lp:Number,
            pdp:Number,
            apaga:Number,
            nnpp: Number
           },
  
         collectionOfficer:String,
         isRigged:Boolean, 
         totalLG:Number,
         

         }
        
    
)

const user =mongoose.model("universe", stateschema)
 


data.post("/createdata", async (req,res)=>{

   
    // // const newResult = await new user(req.body);
    // //  newResult.save()
    
    
    // res.status(200).json(newResult)
    try {
        const newResult = await new user(req.body);
        //   newResult.save()
        // const getElectionDetails = await user.findById(req.params.id)
  
       const  electionResult = newResult.result
  
        let highestValue = -Infinity
        let winningParty = null
  
        for(const parties in electionResult){
            const value = electionResult[parties]
            
            if(value > highestValue){
                highestValue = value
                winningParty = parties
            }
           
        }
         newResult.save()
        
        res.status(200).json({message: `The winner of this state is ${winningParty} with ${highestValue}`, data:newResult})
        
        // res.status(200).json(newResult)
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
     
    
}
)


// get all state

data.get("/getallstate", async(req,res)=>{
    const  all  = await user.find();
 
      
    
    res.status(200).json({
        message:"the available user are:" + all.length, data:all, 
        
    })
})

//get one  state
data.get("/getonestate/:id" , async(req, res)=>{
    const id =req.params.id
    const getone = await user.findById(id)
    
    res.status(200).json(
        {message:`the infomations of this ${id} is:`, 
        data:getone}
    )

})



// delete a state
data.delete("/delete/:id", async(req, res)=>{
    const id = req.params.id;
    const deleteUser = await user.findByIdAndDelete((id))

    res.status(200).json(
       { message:`this infomation of the user with the id of ${id} has been delete`,
            data:deleteUser
    
            }
    )
})


// update a state details
data.put( "/updatestate/:Id", async ( req, res ) => {
    try {
        const stateId = req.params.Id;
        const data = await user.findById( stateId );
        
        const bodyData = {
        state: req.body.state || data.state,
        parties: req.body.parties || data.parties,
        result: {
            apc: req.body.apc || data.result.apc,
            lp: req.body.lp || data.result.lp,
            pdp: req.body.pdp || data.result.pdp,
            apaga: req.body.apaga || data.result.apaga,
            nnpp: req.body.nnpp || data.result.nnpp
            },
            collectionOfficer: req.body.collectionOfficer || data.collectionOfficer,
            isRiggedr: req.body.isRigged || data.isRigged,
            totalLG:req.body.totalLG|| data.totalLG,
        }

        await user.updateOne( bodyData );
        if ( bodyData ) {
            res.status(200).json(bodyData);
        } else {
            res.status( 400 ).json( {
                Error: 'Error updating id.'
            })
        }
    } catch ( e ) {
        res.status( 400 ).json( {
            Message: e.message
        })
    }
} )



// get a willer of a state with the state name

data.get("/stateWinner/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const electionResult = await user.findOne({ state });
  
      if (!electionResult) {
        res.status(404).json({
          error: "No election result found for the specified state.",
        });
      } else {
        const resultData = electionResult.result;
        let stateWinner = null;
        let highestVoteCount = null;
  
        for (const party in resultData) {
          if (resultData.hasOwnProperty(party)) {
            const voteCount = resultData[party];
            if (highestVoteCount === null || voteCount > highestVoteCount) {
              highestVoteCount = voteCount;
              stateWinner = party;
            }
          }
        }
  
        res.status(200).json({
          Message: `The winner in this state is ${stateWinner}`,
          state,
          stateWinner,
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  })

data.get("/winner/state", async(req, res)=> {
    try {
        const getElectionDetails = await user.find(req.params.state)
  
        electionResult = getElectionDetails.result
  
        let highestValue = -Infinity
        let winningParty = null
  
        for(const parties in electionResult){
            const value = electionResult[parties]
            
            if(value > highestValue){
                highestValue = value
                winningParty =parties
            }
        }
        res.status(200).json({message: `The winner of this state is ${winningParty} with ${highestValue}`})
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
  })

  // get the overall willer of the election
data.get("/overallWinner", async (req, res) => {
    try {
      const allResults = await user.find();
      if (!allResults || allResults.length === 0) {
        res.status(404).json({
          error: "No election results found.",
        });
      } else {
        let overallResults = {};
        for (const result of allResults) {
          const resultData = result.result;
          for (const party in resultData) {
            if (resultData.hasOwnProperty(party)) {
              const voteCount = resultData[party];
              if (overallResults.hasOwnProperty(party)) {
                overallResults[party] += voteCount;
              } else {
                overallResults[party] = voteCount;
              }
            }
          }
        }
  
        let overallWinner = null;
        let highestVoteCount = null;
        for (const party in overallResults) {
          if (overallResults.hasOwnProperty(party)) {
            const voteCount = overallResults[party];
            if (highestVoteCount === null || voteCount > highestVoteCount) {
              highestVoteCount = voteCount;
              overallWinner = party;
            }
          }
        }
  
        res.status(200).json({
          overallWinner,
          results: overallResults,
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  });

  //cecked if the result is rigged
  data.get('/riggedresult', async (req, res) => {
    try {
      const electionResults = await user.find();
      if (electionResults.length === 0) {
        return res.status(404).json({
          Error: 'No election results found.',
        });
      }
  
      let riggedCount = 0;
      let notRiggedCount = 0;
  
      for (const electionResult of electionResults) {
        if (electionResult.isRigged) {
          riggedCount++;
        } else {
          notRiggedCount++;
        }
      }
  
      let overallRiggedResult;
      if (riggedCount > notRiggedCount) {
        overallRiggedResult = 'Election is obviously rigged';
      } else if (riggedCount < notRiggedCount) {
        overallRiggedResult = 'Election not rigged';
      } else {
        overallRiggedResult = 'Election is fair';
      }
      res.status(200).json({
        overallRiggedResult,
        riggedCount,
        notRiggedCount,
      });
    } catch (error) {
      res.status(400).json({
        Message: error.message,
  });
  }
  });
  
        

mongoose.connect("mongodb+srv://oghenedemartin:eQX78GsvMNFP2p44@cluster0.rivgmxb.mongodb.net/")
.then(()=>{
   console.log("connection successful")
}) 
data.listen(PORT , ()=>{
    console.log(`server is listening to ${PORT}`)
})
