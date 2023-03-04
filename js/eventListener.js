var uid = null;

AFRAME.registerComponent("marker-handler",{
init: async function(){


  if(uid === null){
    this.askuid()
  }
this.el.addEventListener("markerFound", ()=>{
  if(uid !== null){
console.log("marker is found!")
  this.handleMarkerFound()

  }
})
  
this.el.addEventListener("markerLost", ()=>{
console.log("marker is lost!")
  this.handleMarkerLost()
})
},
  
askuid: function(){

  var iconurl = "toy.jpg"

  swal({
    title:"",
    icon:iconurl,
    content:{
      element:"input",
      attributes:{
        placeholder: "type your uid Ex.(U01)",
        type: "string",
        min: 1
      }
    },
    closeOnClickOutside: false
  }).then(inputValue =>{
    uid = inputValue
  })
},

handleMarkerFound: function(toys, markerId){

   // Getting today's day
   var todaysDate = new Date();
   var todaysDay = todaysDate.getDay();
   
   // Sunday - Saturday : 0 - 6
   var days = [
     "sunday",
     "monday",
     "tuesday",
     "wednesday",
     "thursday",
     "friday",
     "saturday"
   ];

   var toy = toys.filter(toy => toys.filter === markerId)[0]

   if (toy.unavailable_days.includes(days[todaysDay])) {
    swal({
      icon: "warning",
      title: toy.toy_name.toUpperCase(),
      text: "This toy is not available today!!!",
      timer: 2500,
      buttons: false
    });
  } else {
     // Changing Model scale to initial scale
    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("position", toy.model_geometry.position);
    model.setAttribute("rotation", toy.model_geometry.rotation);
    model.setAttribute("scale", toy.model_geometry.scale);

    //Update UI conent VISIBILITY of AR scene(MODEL , INGREDIENTS & PRICE)

    model.setAttribute("visible", true);
    

    var ingredientsContainer = document.querySelector(`#main-plane-${toy.id}`);

    ingredientsContainer.setAttribute("visible", true);

    var pricePlane = document.querySelector(`#price-plane-${toy.id}`);

    pricePlane.setAttribute("visible", true);


        var buttonDiv = document.getElementById("button-div")

        buttonDiv.style.display = "flex"
          
        var ratingButton = document.getElementById("summary")

        var orderButton = document.getElementById("order")

        var payButton = document.getElementById("pay-button")

        ratingButton.addEventListener("click", function(){
          swal({
          icon:"warning",
          title:"rate toy",
          text:"work in progress"
          })
        })
        
        orderButton.addEventListener("click", function(){
        swal({
        icon:"warning",
        title:"Thanks for ordering!",
        text:"It will be delivered soon!"
        })
      })

      orderSummaryButtton.addEventListener("click", () =>
      this.handleOrderSummary()
    );

    payButton.addEventListener("click", () =>
    this.handlePay()
    )

    }

    
          
        
 },

 handleOrder: function(tNumber, toy) {
  firebase.firestore().collection("users").doc(tNumber).get().then((doc) =>{
   var details = doc.data()

   if(details["current_orders"][toy.id]){
     details["current_orders"][toy.id]["quantity"]+=1
     var currentQuantity = details["current_orders"][toy.id]["quantity"]
     details["current_orders"][toy.id]["subtotal"]= currentQuantity*toy.price
   }else{
     details["current_orders"][toy.id]={
       item: toy.toy_name,
       price: toy.price,
       quantity: 1,
       subtotal: toy.price*1
     }
   }

   details.total_bill += toy.price
   firebase.firestore().collection("users").doc(doc.id).update(details)
  })
 },

 getToys: async function(){
  return await firebase
  .firestore()
  .collection("toys")
  .get()
  .then(snap => {
    return snap.docs.map(doc => doc.data())
  })
 },

 getOrderSummary: async function (tNumber) {
  return await firebase
    .firestore()
    .collection("users")
    .doc(tNumber)
    .get()
    .then(doc => doc.data());
},
handleOrderSummary: async function () {

  //Getting Table Number
  var tNumber;
  uid <= 9 ? (tNumber = `T0${uid}`) : `T${uid}`;

  //Getting Order Summary from database
  var orderSummary = await this.getOrderSummary(tNumber);

  //Changing modal div visibility
  var modalDiv = document.getElementById("modal-div");
  modalDiv.style.display = "flex";

  //Get the table element
  var tableBodyTag = document.getElementById("bill-table-body");

  //Removing old tr(table row) data
  tableBodyTag.innerHTML = "";

  //Get the cuurent_orders key 
  var currentOrders = Object.keys(orderSummary.current_orders);

  currentOrders.map(i => {

    //Create table row
    var tr = document.createElement("tr");

    //Create table cells/columns for ITEM NAME, PRICE, QUANTITY & TOTAL PRICE
    var item = document.createElement("td");
    var price = document.createElement("td");
    var quantity = document.createElement("td");
    var subtotal = document.createElement("td");

    //Add HTML content 
    item.innerHTML = orderSummary.current_orders[i].item;

    price.innerHTML = "$" + orderSummary.current_orders[i].price;
    price.setAttribute("class", "text-center");

    quantity.innerHTML = orderSummary.current_orders[i].quantity;
    quantity.setAttribute("class", "text-center");

    subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
    subtotal.setAttribute("class", "text-center");

    //Append cells to the row
    tr.appendChild(item);
    tr.appendChild(price);
    tr.appendChild(quantity);
    tr.appendChild(subtotal);

    //Append row to the table
    tableBodyTag.appendChild(tr);
  });

  var totaltr = document.createElement("tr")
  var td1 = document.createElement("td")
  td1.setAttribute("class", "no-line")

  var td2 = document.createElement("td")
  td1.setAttribute("class", "no-line")

  var td3 = document.createElement("td")
  td1.setAttribute("class", "no-line text-center")

  var strong_tag = document.createElement("strong")
  strong_tag.innerHTML = "Total"
  td3.appendChild(strong_tag)

  var td4 = document.createElement("td")
  td4.setAttribute("class", "no-line text-right")
  td4.innerHTML="$" + orderSummary.total_bill 
  totaltr.appendChild(td1)
  totaltr.appendChild(td2)
  totaltr.appendChild(td3)
  totaltr.appendChild(td4)

  tableBodyTag.appendChild(totaltr)
},
handlePayment: function () {

  document.getElementById("modal_div").style.display = "none";
  var tNumber
  uid <= 9 ? (tNumber = `T0${uid}`) : `T${uid}`

  firebase.firestore().collections("users").doc(tNumber).update({
    current_orders:{  },
    total_bill:0
  }).then(()=>{
     swal({
      title: "Thanks for paying",
      icon:"success",
      text:"We hope you have enjoyed your food!!!",
      timer:2500,
      buttons:false
     })
  })

},

 handleMarkerLost: function(){
  var buttonDiv = document.getElementById("button-div")

  buttonDiv.style.display = "none";
}   
 
})
