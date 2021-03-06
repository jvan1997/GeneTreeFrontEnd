import React, { Component } from 'react';
import './App.css';
import './index.css';
import {withRouter} from 'react-router-dom';
import {firebaseApp} from "./firebase";
import './progress-bar-styles.css';
import CustomContentCircularProgressBar from './CustomContentProgressBar'

function user() {
    return firebaseApp.auth().currentUser;
}
function db() {
    return firebaseApp.firestore().collection('users');
}
function entry() {
    return db().doc(user().email);
} 

var fileSelect;
var pdfjsLib;

class Create extends Component {
  componentDidMount () {
    // Load in the pdf library used to parse the pdf
    const script = document.createElement("script");

    script.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.0.943/build/pdf.min.js";
    script.async = true;
    script.onload = this.pdfLibraryLoaded

    document.body.appendChild(script);
}
/**
      * Checks if the user is logged in or not, and gets the list of voters.
      */
	constructor(props) {
        super(props);
        this.state = {
            name: '',
            surname:'',
            sigid: '', 
            major: '', 
            date: (new Date()).getUTCFullYear(),
            units: '',
            file: undefined,
            progressBarPercentage:0,
            progressBarPercentageText:"",
            showProgressBar:false,
            institution:'',
            progressBarStatus:'load', // can be 'load','done','error',
            voted:[],
            loading:true
        };
	
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePDFSubmit = this.handlePDFSubmit.bind(this)
        this.calculateProgressBarPercentageTextCSS = this.calculateProgressBarPercentageTextCSS.bind(this)
    }  
    onChange = date => this.setState({ date })
        backTrack(){
     	this.props.history.goBack();
     }  
     componentWillMount(){
        let test = JSON.parse(localStorage.getItem("logged"));
        if(!test){
            this.props.history.push('/');
        }
        this.authSubscription = firebaseApp.auth().onAuthStateChanged((user2) => {
        firebaseApp.firestore().collection('approved').doc('voted').get().then((doc) => {
          if (doc.exists) {
                    this.setState({voted:doc.data()['voted'], loading:false, currentUser:user2.email});
          } else {
            this.setState({ voted: null });
          }
          
        })
        });
     }
     componentWillUnmount() {
		clearInterval(this.timeout);
	  }
  render() {
    return (
      
        <div class="flex justify-center items-center h-full" >
        <div class="container-xl mx-auto pt-24 bg-transparent rounded">
	  <h1 class=" font-fancy font-bold text-lg text-white mb-4 pl-16 text-3xl "> Create Certificate </h1>
    <form onSubmit={this.handleSubmit}>
            <div class="flex justify-center col-md-6 items-center">
                <p class="text-white font-fancy font-bold text-lg">First Name:</p>
                <input required class="shadow ml-12 mt-2 mb-2 appearance-none font-fancy font-bold border rounded w-1/2 py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" name="name" value={this.state.name} onChange={this.handleChange}/>
                </div>
                <div class="flex justify-center col-md-6 items-center">
                <p class="text-white font-fancy font-bold text-lg">Last Name:</p>
                <input required class="shadow ml-13 mt-2 mb-2 appearance-none font-fancy font-bold border rounded w-1/2 py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="surname" type="text" name="surname" value={this.state.surname} onChange={this.handleChange}/>
                </div>
                <div class="flex justify-center col-md-6 items-center">
                <p class="text-white font-fancy font-bold text-lg">Signature ID:</p>
                <input required class="shadow ml-11 mt-2 mb-2 appearance-none font-fancy font-bold border rounded w-1/2 py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="sigid"  type="text" name="sigid"  onChange={this.handleChange}/>
                </div>
                <div class="flex justify-center col-md-6 items-center">
                <p class="text-white font-fancy font-bold text-lg">Institution:</p>
                <input required class="shadow ml-14 mt-2 mb-2 appearance-none font-fancy font-bold border rounded w-1/2 py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="institution"  type="text" name="institution" value={this.state.institution} onChange={this.handleChange}/>
                </div>
                <div class="flex justify-center col-md-6 items-center">
                <p class="text-white font-fancy font-bold text-lg">Approval Year:</p>
                <input required class="shadow ml-8 mt-2 mb-2 appearance-none font-fancy font-bold border rounded w-1/2 py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="date"  type="number" min="1900" step="any" name="date" value={this.state.date}  onChange={this.handleChange}/>
                </div>
        <div class="flex justify-left pl-4 col-md-6 items-center ">
            <p class="text-white font-fancy font-bold text-lg mr-16">Major:</p>
            
             <select required class="block ml-6 h-8 w- pl-2 pr-1 font-fancy font-bold appearance-none bg-whiteborder border-purple-lighter text-black ml-2 rounded leading-tight focus:outline-none focus:bg-white focus:border-grey"  id="major" name="major" value={this.state.major} onChange={this.handleChange} >	
		        <option value=""> Select </option>
                <option value="BS Aerospace Engineering">Aerospace Engineering</option>
            <option value="BS Biomedical Engineering">Biomedical Engineering</option>
            <option value="BS Bioengineering Engineering">Biomedical Engineering</option>
		        <option value="BS Chemical Engineering">Chemical Engineering</option>
            <option value="BS Civil Engineering">Civil Engineering</option>
            <option value="BS Computer Engineering">Computer Engineering</option>
		        <option value="BS Electrical Engineering">Electrical Engineering</option>
            <option value="BS Industrial Engineering">Industrial Engineering</option>
            <option value="BS Mechanical Engineering">Mechanical Engineering</option>
            <option value="BS Software Engineering">Software Engineering</option>

          </select>
          </div>
        <div class="flex justify-center col-md-6 items-center">
                <p class="text-white font-fancy font-bold text-lg">Units Completed:</p>
                <input required class="shadow ml-2 mt-2 mb-2 appearance-none border rounded w-1/2 py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="units" type="number" min="0" step="0.1" name="units" value={this.state.units} onChange={this.handleChange}/>
                </div>
        <div class="pl-4">
        <button class="inline-block h-12 w-32 border-b-2 border-t-2 border-l-2 border-r-2 px-4 py-2 ml-2 mr-2 font-fancy font-bold text-lg leading-none border rounded bg-transparent text-white border-white hover:border-grey hover:text-grey mt-4 mb-4 lg:mt-0" type="button" onClick={() => this.backTrack()}> Cancel</button>
        <input class="inline-block h-12 w-32 border-b-2 border-t-2 border-l-2 border-r-2 px-4 py-2 ml-2 mr-2 font-fancy font-bold text-lg leading-none border rounded bg-transparent text-white border-white hover:border-grey hover:text-grey mt-4 mb-4 lg:mt-0" type="submit" value="Create" />
        </div>
    </form>

        <div>
            <form>
            <div class="flex items-center justify-center bg-transparent">
    <label class="w-48 h-14 flex flex-col items-center bg-transparent rounded shadow-lg tracking-wide uppercase border-2 border-white cursor-pointer hover:border-4 ">
        <svg class="w-8 h-8" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
        </svg>
        <span class="mt-2 text-white font-fancy font-bold text-base leading-normal">Upload</span>
        <input type='file' class="hidden" name="file" onChange={this.handlePDFSubmit } />
    </label>
</div>
                
            </form>
            <div class="progbar" style={{width:'100px', height:'100px', margin:'auto', padding:'10px'}}>
            { this.state.showProgressBar ? <CustomContentCircularProgressBar percentage={this.state.progressBarPercentage} className="progbar" > 
                <div class="text-center text-white">
                    <div class="CustomContentCircularProgressBar-Percentage">
                        {this.state.progressBarPercentage} %
                    </div>
                    <div class={ this.calculateProgressBarPercentageTextCSS() }>
                        {this.state.progressBarPercentageText}
                    </div>
                    
                </div>
            
            
            </CustomContentCircularProgressBar>
            : null}
            
            </div>
            
            </div>

              </div>
              </div>
    );
  }
  handleChange(event) {
    this.setState({
        [event.target.name]:event.target.value
	});
  }

  handleSubmit(event) {
    event.preventDefault();

    // Check for sufficient units for graduated status
    if( this.state.units < 120){
        alert("Insufficient amount of units for graduation")
        return
    }

    this.setState({ showProgressBar:true, progressBarPercentage: 0, progressBarPercentageText: "Uploading...", progressBarStatus:'load'})

    // Prepare information to be sent to server
    let relevantState
    if( this.state.file != undefined){
        relevantState = { 
            "name": this.state.name,
            "surname": this.state.surname,
            "sigid": this.state.sigid,
            "major": this.state.major,
            "units": this.state.units,
            "file": this.state.file,
            "institution": this.state.institution,
            "date": this.state.date
        }
    }
    else{
        if( this.state.file == undefined){
            relevantState = { 
                "name": this.state.name,
                "surname": this.state.surname,
                "sigid": this.state.sigid,
                "major": this.state.major,
                "units": this.state.units,
                "institution": this.state.institution,
                "date": this.state.date
            }
        }
    }
    
    
    // Prepare the post request to the server
    // https://stackoverflow.com/questions/49686694/uploading-a-file-using-fetch-in-reactjs
    let url = 'http://localhost:8080/check'
    let options = {
        method: 'post',
        
        
    }
    options.body = new FormData();
    for (let key in relevantState) {
    options.body.append(key, relevantState[key]);
    }

    var xhr = new XMLHttpRequest()
    // Progress Bar Event Listener
    xhr.upload.addEventListener("progress", e=>{
        if( e.lengthComputable){
            var percentComplete = Math.round(e.loaded * 100 / e.total)
            this.setState({ progressBarPercentage: percentComplete/2 })
        }
        else{
            console.log("Cannot compute size")
        }
    },false)
    
    // xhr.setRequestHeader("Content-Type","multipart/form-data")
    var self = this
    // Handle server response
    xhr.onreadystatechange = function(){
        if(this.readyState === XMLHttpRequest.DONE && this.status===200){
        delete relevantState.file

        self.timeout = setInterval(() => {
            let newP = self.state.progressBarPercentage+1;
            if (self.state.progressBarPercentage < 60) {
              self.setState({ progressBarPercentage: newP, progressBarPercentageText:"Uploading." });
            }
            else if (self.state.progressBarPercentage < 70) {
                self.setState({ progressBarPercentage: newP, progressBarPercentageText:"Uploading.." });
            }
            else if (self.state.progressBarPercentage < 80) {
                self.setState({ progressBarPercentage: newP, progressBarPercentageText:"Uploading..." });
            }
            else{
            }
            
          }, 250);
          // Update certificate
        entry().update({"certificate":relevantState}).then(

            success => {
                self.timeout = setInterval(() => {
                    if (self.state.progressBarPercentage < 100) {
                      let newP = self.state.progressBarPercentage+1;
                      self.setState({ progressBarPercentage: newP });
                        }
                    	else{
                            clearInterval(self.timeout)
                            self.setState({ progressBarPercentage: 100, progressBarPercentageText:"Done!", progressBarStatus:'done' })
                            let voted = self.state.voted;
                                for (var i=voted.length-1; i>=0; i--) {
                                if (voted[i] === self.state.currentUser) {
                                    voted.splice(i, 1);
                                    break;       //<-- Uncomment  if only the first term has to be removed
                                }
                                }
                                firebaseApp.firestore().collection('approved').doc('voted').set({voted}).then((returns) =>{
                                alert("Certificate has been created, you must get your certificate verified");
                                self.backTrack();                            
                            })
                            
                        }
                    }, 250);

                    

                
            },
            err =>{
                self.setState({ progressBarPercentageText:"Error saving data", progressBarStatus:'error' })
            }
        
        );
        }
        // Server responds with error status
        if(this.readyState === XMLHttpRequest.DONE && this.status >= 400){
            switch(this.status){
                case 400:
                alert("No file submitted")
                self.setState({ progressBarPercentageText:"Error can't find file", progressBarStatus:'error' })
                break

                case 422:
                alert("Invalid sigid")
                self.setState({ progressBarPercentage: 0, progressBarPercentageText: "Invalid sigid", progressBarStatus:'error' })
                break

                default:
                alert("Error")
                self.setState({ progressBarPercentageText:"Error",progressBarStatus:'error' })

            }


        }
               
    }

    xhr.open("POST", url, true)
    xhr.send(options.body)

  }

  calculateProgressBarPercentageTextCSS(){
    let className = "CustomContentCircularProgressBar-PercentageText "
        switch(this.state.progressBarStatus){
            case 'load' :  return className + ""
                break
            case 'error' : return className + "CustomContentCircularProgressBar-PercentageText-Error"
                break;
            case 'done': return className + "CustomContentCircularProgressBar-PercentageText-Done"
                break;
            default: return className
        }
  }

  // PDF-related code

  handlePDFSubmit(ev){

    fileSelect = ev.currentTarget.files

    // Handle user clicking x  when in file selection popup
    if( fileSelect.length == 0){
        return
    }

    this.setState({file:ev.currentTarget.files[0]},
        ()=>{


            let reader = new FileReader()

            reader.onload = (e)=>{
                let data = e.target.result
  
                this.getPDFText(data).then( (text) =>{
                let strs = text.split("\n")
                let name = ""
                let major = ""
                let units = 0
                let institution = ""
                let date = ""

                let nameToken = "STUDENT NAME:"
                let majorToken = "MAJOR:"
                let unitsToken = "ALL COLLEGE:"
                let institutionToken = "University"
                let dateToken = "DATE PRINTED:"
                let institutionFound = false
                let dateFound = false

                for(var i=0;i<strs.length;i++){
                    if( !institutionFound && (/.*university.*/gi).test(strs[i])){
                        institution = strs[i]
                        institutionFound = true
                        this.setState({institution:institution})
                    }
                    if( !dateFound && strs[i].includes(dateToken)){
                        let dateString = strs[i].split(dateToken)[1].trim()
                        dateFound = true
                        date = new Date(dateString)
                        this.setState({date:date.getUTCFullYear()})
                    }

                    if( strs[i].includes(nameToken)){
                        name = strs[i].split(nameToken)[1].trim()
                        let nameComponents = name.split(" ")
                        let lastName = nameComponents[0].replace(",","")
                        let firstName = nameComponents[1]
                        this.setState({name:firstName, surname:lastName})
                    }
                    if( strs[i].includes(majorToken)){
                        major = strs[i].split(majorToken)[1].trim()
                        this.setState({major:major})
                    }
                    if( strs[i].includes(unitsToken)){
                      units = strs[i].trim().split(/\s+/)
                  }
                }
                let totalUnits = units[4]
                this.setState({units:totalUnits})
               })
                
            }
            var file = fileSelect[0]
                reader.readAsDataURL(this.state.file)
        })
}




// Event when pdf library has been loaded
  pdfLibraryLoaded(ev){
    pdfjsLib = window['pdfjs-dist/build/pdf']
}

/**
 * Get the text content from the pdf
 * @param {*} data Is pdf read as data url
 */
async getPDFText(data){
    var loadingTask = pdfjsLib.getDocument(data);
    let pdf = await loadingTask.promise
    let pdfText = ''

    for(var i=1;i<=pdf.numPages;i++){
        let page = await pdf.getPage(i)
        let textContent = await page.getTextContent()

        pdfText = textContent.items.reduce( (acc,curr) => acc + curr.str +"\n", pdfText )
    }
    
    return pdfText
}



}
export default withRouter(Create);
