'use strict';

//list of bats
//useful for ALL 5 steps
//could be an array of objects that you fetched from api or database
const bars = [{
  'id': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
  'name': 'freemousse-bar',
  'pricePerHour': 50,
  'pricePerPerson': 20
}, {
  'id': '165d65ec-5e3f-488e-b371-d56ee100aa58',
  'name': 'solera',
  'pricePerHour': 100,
  'pricePerPerson': 40
}, {
  'id': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
  'name': 'la-poudriere',
  'pricePerHour': 250,
  'pricePerPerson': 80
}];
function BookingPrice(barObj, eventObj, actorsObj){
  for(var i = 0 ; i<barObj.length;i++){
    for(var j = 0; j < eventObj.length; j++){
      if(eventObj[j].barId == barObj[i].id){
        if(eventObj[j].persons >= 10 && eventObj[j].persons < 20){
          barObj[i].pricePerPerson = barObj[i].pricePerPerson * 0.9;
        }
        else if(eventObj[j].persons >= 20 && eventObj[j].persons < 60){
          barObj[i].pricePerPerson = barObj[i].pricePerPerson * 0.7;
        }
        else if(eventObj[j].persons >= 60){
          barObj[i].pricePerPerson = barObj[i].pricePerPerson * 0.5;
        }
        //on part du principe que deductibleReduction est un supplément, et n'est donc pas affecté par les discounts => gains de 10 à 50 centimes par tête
        if(eventObj[j].deductibleReduction == true){
          barObj[i].pricePerPerson++;
        }
        eventObj[j].price = eventObj[j].time * barObj[i].pricePerHour + eventObj[j].persons * barObj[i].pricePerPerson;
        if(eventObj[j].deductibleReduction == true){
          //la valeur de la commission n'étant pas affichée dans le json, on peut se permettre de ne pas y compter le supplément de deductibleReduction
          var com = (eventObj[j].price - eventObj[j].persons)*0.3;
          //pour à la place l'injecter directement dans la commission de privateaser
          eventObj[j].commission.privateaser = com * 0.5;
        }else{
          var com = eventObj[j].price * 0.3;
          eventObj[j].commission.privateaser = com * 0.5 - eventObj[j].persons;
        }
        eventObj[j].commission.insurance = com * 0.5;
        eventObj[j].commission.treasury = eventObj[j].persons;
        for(var k = 0; k < actorsObj.length; k++){
          if(actorsObj[k].eventId == eventObj[j].id){
            actorsObj[k].payment[0].amount = eventObj[j].price;
            actorsObj[k].payment[1].amount = eventObj[j].price - eventObj[j].commission.insurance - eventObj[j].commission.treasury - eventObj[j].commission.privateaser;
            actorsObj[k].payment[2].amount = eventObj[j].commission.insurance;
            actorsObj[k].payment[3].amount = eventObj[j].commission.treasury;
            actorsObj[k].payment[4].amount = eventObj[j].commission.privateaser;
          }
        }
      }
    }
  }
}
function ParseJsonArray(array){
  var objectArray = new Array();
  for(var i = 0; i<array.length;i++)
  {
    objectArray[i] = JSON.parse(JSON.stringify(array[i]));
  }
  return objectArray;
}
//list of current booking events
//useful for ALL steps
//the time is hour
//The `price` is updated from step 1 and 2
//The `commission` is updated from step 3
//The `options` is useful from step 4
const events = [{
  'id': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
  'booker': 'esilv-bde',
  'barId': 'f944a3ff-591b-4d5b-9b67-c7e08cba9791',
  'time': 4,
  'persons': 8,
  'options': {
    'deductibleReduction': false
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'privateaser': 0
  }
}, {
  'id': '65203b0a-a864-4dea-81e2-e389515752a8',
  'booker': 'societe-generale',
  'barId': '165d65ec-5e3f-488e-b371-d56ee100aa58',
  'time': 8,
  'persons': 30,
  'options': {
    'deductibleReduction': true
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'privateaser': 0
  }
}, {
  'id': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
  'booker': 'otacos',
  'barId': '6e06c9c0-4ab0-4d66-8325-c5fa60187cf8',
  'time': 5,
  'persons': 80,
  'options': {
    'deductibleReduction': true
  },
  'price': 0,
  'commission': {
    'insurance': 0,
    'treasury': 0,
    'privateaser': 0
  }
}];

//list of actors for payment
//useful from step 5
const actors = [{
  'eventId': 'bba9500c-fd9e-453f-abf1-4cd8f52af377',
  'payment': [{
    'who': 'booker',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'bar',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'privateaser',
    'type': 'credit',
    'amount': 0
  }]
}, {
  'eventId': '65203b0a-a864-4dea-81e2-e389515752a8',
  'payment': [{
    'who': 'booker',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'bar',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'privateaser',
    'type': 'credit',
    'amount': 0
  }]
}, {
  'eventId': '94dab739-bd93-44c0-9be1-52dd07baa9f6',
  'payment': [{
    'who': 'booker',
    'type': 'debit',
    'amount': 0
  }, {
    'who': 'bar',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'insurance',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'treasury',
    'type': 'credit',
    'amount': 0
  }, {
    'who': 'privateaser',
    'type': 'credit',
    'amount': 0
  }]
}];
var barObj = ParseJsonArray(bars);
var eventObj = ParseJsonArray(events);
var actorsObj = ParseJsonArray(actors);
BookingPrice(barObj, eventObj, actorsObj);
console.log(eventObj);
console.log(actorsObj);
