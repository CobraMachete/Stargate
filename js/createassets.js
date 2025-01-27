//GLOBAL VARS FOR CREATE
var entityCheckObj = [
    {
        shot_id: '',
        shot_name: '',
        compfolder_id: '',
        compfolder_name: '',
        threedfolder_id: '',
        threedfolder_name: '',
        teamsobjectcmp_id: '',
        teamsobjectcmp_name: '',
        teamsobjectthrd_id: '',
        teamsobjectthrd_name: '',

        
    }
]

var ERROR_MULTIPLE_TMS_OBJ = "MULTIPLE_TEAMS";
var ERROR_SHOT_EXISTS = "SHOT_EXISTS";
var ERROR_SHORT_TITLE = "ERROR: SHOT NAME TOO SHORT";
var ERROR_NOTNUM = "ERROR: SHOT NAME MUST START WITH 4 DIGITS";
var ERROR_MISSING_MULTICOMP = "ERROR: MULTICOMP OBJECT IS UNNAMED";
var ERROR_DUPE_TASK = "ERROR: DUPLICATE TASK";

//COMP AND 3D TASK ERROR LISTS
var cmpTaskErrs = [];
var thrDTaskErrs = [];

function preFlightComboElement() {

    var propsearchbar = document.getElementById("searchbar");
    var pkgsearchbar = document.getElementById("packagesearchbar");

    var propentry = propsearchbar.value;
    var pkgentry = pkgsearchbar.value;

    var propertyname;
    var pkgname;

    //CHECKING PROPERTY SEARCHBAR VALUE
    if (propentry.length == 0 || propentry == "") {
        return false
    } else {
        propertyname = propentry;
    }

    //CHECKING SHOW PACKAGE SEARCHBAR VALUE
    if (pkgentry.length == 0 || pkgentry == "") {
        pkgname = "00_regular_season";
    } else {
        pkgname = pkgentry;
    }

    var namearray = [propertyname, pkgname];
    return namearray


}

function preflightChecks() {
    //DEFOCUS BG ELEMENTS
    blurBGElements();

    // //INIT RIVE ANIM
    triggerRiveStart();

    // INTERFACE ERROR CHECKING
    checkToggles().then(function (tglresult) {

        if (tglresult !== true) {
            throw new Error(tglresult);
        }

        checkShotStructure().then(function (structresult) {
            if (structresult !== true) {
                throw new Error(structresult);
            }

            console.log("ERROR CHECKS PASSED.  MOVING ON...")
            createShotAndTasks();

        })
        .catch(error => {
            console.log(error);
            triggerFailure(error);
        });
 
    })
    .catch(error => {
        console.log(error);
        triggerFailure(error);
    });
}


function createPropAndPackage() {

    
    //CREDENTIALS AND SESSION
    var creds = window.credentials;
    console.debug(creds);

    session = new ftrack.Session(
        creds.serverUrl,
        creds.apiUser,
        creds.apiKey
    );

    var comboNameArray = preFlightComboElement();

    //GETTING BASE ENTITY
    var entity = ftrackWidget.getEntity();

    //ESTABLISHING VARS FOR CREATED ENTITIES
    var propertyName = comboNameArray[0];
    var packageName = comboNameArray[1];
    
    
    //PROMISE CHAIN FUNCTIONS
    function propertyItemPromise() {
        
        return new Promise(function(resolve,reject) {

            createProperty(entity, propertyName, packageName)
                .then(resPropEnt => {

                    console.log(resPropEnt);
                    resolve(resPropEnt)
                    

                }).catch((err) => {
                    console.log(err);
                    rejections.push[err];
                    reject(err);
                });

        })
    }
    
    
    //GET AND DO EVERYTHING
    propertyItemPromise().then(function(res) {

        console.log(res);
        
    })

}

function createShotAndTasks() {

    var rejections = [];

    //COMP AND 3D TASK LISTS
    var cmpTaskList = [];
    var thrDTaskList = [];
    
    //3D TASK TYPES
    var mayaType = "c53970b0-ecbe-433d-a307-b8477d7e7c5a";
    var c4dType = "e543387d-6f3f-4184-8da3-34225139c643";
    var maxType = "ced440d9-9851-4165-ac40-fe0a4aa290b8";
    var cmpType = "44dd23b6-4164-11df-9218-0019bb4983d8";
    var templateType = "e88adbd1-851f-415f-bc63-214d22bfc3b9";

    //ASSIGNING TASK TYPE BASED ON SELECTION
    var c4dtasktypeselect = document.getElementById("c4dicon");
    var mayatasktypeselect = document.getElementById("mayaicon");
    var the3dtasktype;
    if (c4dtasktypeselect.classList.contains("rowiconon")) {
        the3dtasktype = c4dType;
    } else {
        the3dtasktype = mayaType;
    }

    
    //CREDENTIALS AND SESSION
    var creds = window.credentials;
    console.debug(creds);

    session = new ftrack.Session(
        creds.serverUrl,
        creds.apiUser,
        creds.apiKey
    );

    //BOOLES FOR TOGGLES
    var isCompElement = false;
    var is3DElement = false;
    var isTeamsObj = false;
    var hasShotNumbering = false;

    //SHOT NAME FROM UI
    var shotNameField = document.getElementById("searchbar");
    var currShotName = shotNameField.value;

    //TEAMS OBJ NAME FROM UI
    var teamsObjField = document.getElementById("standalonefield");
    var teamsObjName = teamsObjField.value;
    
    //COMP AND 3D TASK TOGGLES
    var cmptggle = document.getElementById("compswitch");
    var threedtggle = document.getElementById("threedswitch");
    var stndtggle = document.getElementById("standaloneswitch");

    var compTbl = document.getElementById("comptablebody");
    var thrdTbl = document.getElementById("threedtablebody");

    var theshots = document.getElementById("threedshots");
    var shotchildren = [];

    if (cmptggle.classList.contains("toggle-on")) {

        console.log("THE COMP TOGGLE IS ON!")
    
        isCompElement = true;

        for (var i = 0; i < compTbl.rows.length; i++) {
            var currrow = compTbl.rows[i];
            var rowinpt = currrow.children[0].children[0].value;
            cmpTaskList.push(rowinpt)
        }

        console.log(cmpTaskList)
    }

    if (threedtggle.classList.contains("toggle-on")) {
        console.log("THE 3D TOGGLE IS ON!")
        is3DElement = true;

        //BUILD ARRAY OF CLASSLIST FOR NUMBERING SYSTEM
        for (var j = 1; j < theshots.children.length; j++) {
            shotchildren.push(theshots.children[j].classList);
        }

        //SET TO TRUE IS ONE OF CLASSLIST IS SHOTNUMSELECT
        for (var l=0; l < shotchildren.length; l++) {
            if (shotchildren[l].contains("shotnumselect")) {
                hasShotNumbering = true;
            }
        }

        //ALGO IF SHOTS ARE NEEDED
        if (hasShotNumbering == true) {

            for (var i = 0; i < thrdTbl.rows.length; i++) {

                var currrow = thrdTbl.rows[i];
                var rowinptbase = currrow.children[0].children[0].value;
                
                for (var k=0; k < shotchildren.length; k++) {
                    if (shotchildren[k].contains("shotnumselect")) {
                        var rowinpt = rowinptbase + "_SHOT_00" + (k+1);
                        thrDTaskList.push(rowinpt);
                    }
                }

                
            }
        
        //ALGO IF NO SHOTS
        } else {

            for (var i = 0; i < thrdTbl.rows.length; i++) {
                var currrow = thrdTbl.rows[i];
                var rowinpt = currrow.children[0].children[0].value;
                thrDTaskList.push(rowinpt)
            }
        }

        
    }

    if (stndtggle.classList.contains("toggle-on")) {
        isTeamsObj = true;
    }

    

    if (isTeamsObj == true) {
        if (teamsObjName.length == 0) {

            rejections.push("MISSING STANDALONE NAME");

            if (rejections.length != 0) {
                var therejects = rejections.join(" and ");
                var errtxt = "Errors: " + therejects.toUpperCase();
                adjustTxtRuntimes("RunError", errtxt);
                adjustTxtRuntimes("RunSuccess", "Input Needed");
            }
            
            setTimeout(function() {
                fireAnim("stopAnim");
                fireAnim("sendErr");
            }, 500);
            
            return
        }
    }
    
    //GETTING BASE ENTITY
    var entity = ftrackWidget.getEntity();

    //ESTABLISHING VARS FOR CREATED ENTITIES
    var theShotEnt;
    var theCompFoldEnt;
    var the3DFoldEnt;
    var thecmpTeamsObjEnt;
    var the3DTeamsObjEnt;

    //PROMISE CHAIN FUNCTIONS
    function shotItemPromise() {
        
        return new Promise(function(resolve,reject) {

            createShot(entity, theprjid, currShotName)
                .then(resShotEnt => {

                    console.log(resShotEnt);
                
                    if (resShotEnt.data != undefined) {
                        theShotEnt = resShotEnt.data;
                    } else {
                        theShotEnt = resShotEnt;
                    }

                    console.log(theShotEnt);
                    resolve(theShotEnt)
                    

                }).catch((err) => {
                    console.log(err);
                    rejections.push[err];
                    reject(err);
                });

        })
    }
    
    function compFoldPromise() {

        return new Promise(function(resolve,reject) {

            if (isCompElement == true) {
                createCmpFold(theShotEnt, theprjid, "02_cmp")
                    .then(resCmpFoldEnt => {

                        console.log(resCmpFoldEnt);
                        if (resCmpFoldEnt.data != undefined) {
                            theCompFoldEnt = resCmpFoldEnt.data;
                        } else {
                            theCompFoldEnt = resCmpFoldEnt;
                        }
                        
                        console.log(theCompFoldEnt)
                        resolve(theCompFoldEnt)

                        

                    }).catch((err) => {
                        console.log(err);
                        rejections.push[err];
                        reject(err);
                    });

            } else {
                resolve("None");
            }
        });
    }

    function threedFoldPromise() {

        return new Promise(function(resolve,reject) {

            if (is3DElement == true) {
                create3DFold(theShotEnt, theprjid, "00_3D")
                    .then(resthrDFoldEnt => {
    
                        console.log(resthrDFoldEnt);

                        if (resthrDFoldEnt.data != undefined) {
                            the3DFoldEnt = resthrDFoldEnt.data;
                        } else {
                            the3DFoldEnt = resthrDFoldEnt;
                        }

                        console.log(the3DFoldEnt);
                        resolve(the3DFoldEnt);
    
                    }).catch((err) => {
                        console.log(err);
                        rejections.push[err];
                        reject(err);
                    });
            } else {
                resolve("None");
            }

            
        });
    }

    function cmpTeamsObjPromise(compElemsActive) {

        return new Promise(function(resolve,reject) {

            if (compElemsActive != "None") {

                //CHECKING IF TEAMS OBJ IS CHECKED
                if (isTeamsObj == true) {
                    createTeamObj(theCompFoldEnt, theprjid, teamsObjName)
                        .then(resteamObjEnt => {

                            if (resteamObjEnt == ERROR_MULTIPLE_TMS_OBJ) {
                                throw new Error(ERROR_MULTIPLE_TMS_OBJ);
                            } else {

                                console.log(resteamObjEnt);
                                if (resteamObjEnt.data != undefined) {
                                    thecmpTeamsObjEnt = resteamObjEnt.data;
                                } else {
                                    thecmpTeamsObjEnt = resteamObjEnt;
                                }
                                console.log(thecmpTeamsObjEnt);
                                resolve(thecmpTeamsObjEnt);

                            }

                            
                            
                            
                        }).catch((err) => {
                            
                            if (err == ERROR_MULTIPLE_TMS_OBJ) {
                                reject(ERROR_MULTIPLE_TMS_OBJ);
                            } else {
                                console.log(err);
                                rejections.push[err];
                                reject(err);
                            }
                            
                        });

                } else {

                    resolve(theCompFoldEnt);
                    
                }
            } else {
                resolve("None");
            }

            
        });
        
    }

    function thrdTeamsObjPromise(thrdElemsActive) {

        return new Promise(function(resolve,reject) {

            if (thrdElemsActive != "None") {
                //CHECKING IF TEAMS OBJ IS CHECKED
                if (isTeamsObj == true) {
                    createTeamObj(the3DFoldEnt, theprjid, teamsObjName)
                        .then(resteamObjEnt => {

                            console.log(resteamObjEnt);
                            if (resteamObjEnt.data != undefined) {
                                the3DTeamsObjEnt = resteamObjEnt.data;
                            } else {
                                the3DTeamsObjEnt = resteamObjEnt;
                            }
                            console.log(the3DTeamsObjEnt);
                            resolve(the3DTeamsObjEnt);
                            
                        }).catch((err) => {
                            console.log(err);
                            reject(err);
                            rejections.push[err];
                            
                        });

                } else {

                    resolve(the3DFoldEnt);
                    
                }
            } else {
                resolve("None");
            }

            
        });
        
    }


    //GET AND DO EVERYTHING
    shotItemPromise().then(function(res) {

        console.log(res);
        return Promise.all([compFoldPromise(), threedFoldPromise()])

    }).then(function(response) {
        
        
        console.log(response);
        return Promise.all([cmpTeamsObjPromise(response[0]), thrdTeamsObjPromise(response[1])])
        
        

    }).then(function(result) {

        console.log(result);
        return Promise.all([processCompTasks(cmpTaskList, result[0], theprjid, cmpType), process3DTasks(thrDTaskList, result[1], theprjid, the3dtasktype), processCompTasks(["TEMPLATE"], result[0], theprjid, templateType), process3DTasks(["TEMPLATE"], result[1], theprjid, templateType)])

    }).then(function(resp) {
        
        console.log("PROCESSED ALL ENTRIES")

        if (rejections.length != 0) {
            var therejects = rejections.join(" and ");
            var errtxt = "Run errors: " + therejects.toUpperCase();
            adjustTxtRuntimes("RunError", errtxt);
            adjustTxtRuntimes("RunSuccess", "Shots finished with errors");
        }
    
        if (rejections.length > 0) {
            setTimeout(function() {
                fireAnim("stopAnim");
                fireAnim("sendErr");
                
            }, 500);
        } else {
            setTimeout(function() {
                fireAnim("stopAnim");
            }, 500);
        }
        
        

        
    })
    .catch(error => {
        // Handle errors
        console.error(error);
        if (error == "MULTIPLE") {
            //TRIGGERING ERROR FOR MULTIPLE TEAMS ITEMS
            adjustTxtRuntimes("RunError", "A Teams Object already exists.");
            adjustTxtRuntimes("RunSuccess", "Error: Multiple Teams Objects");

            setTimeout(() => {
                fireAnim("stopAnim");
                fireAnim("sendErr");
                
            },1000);
        }
    });

}

// CREATE NEW PROPERTY
function createProperty(entity, propertyName, packageName) {

    return new Promise(function (resolve, reject) {

        console.log(entity)
        session.query('select name from Property where name is ' + propertyName +' and parent_id is "' + entity.id + '"')
            .then(function (response) {
                
                console.log(response);

                return new Promise(function (resp, rej) {

                    if (response.data.length == 0) {

                        const newProperty = session.create('Property', {
                            name: propertyName,
                            parent_id: entity.id,
                            project_id: entity.id,
                        });

                        console.log(newProperty);
                        resp(newProperty)
                        
    
                        // const newProduction = session.create('Production', {
                        //     name: '03_brdcast_gfx',
                        //     parent_id: newShowPackage.id,
                        //     project_id: entity.id,
                        // })

                        // console.log(newProduction);

                         
                        
               
                        
                    } else {
                        console.log('Property ALREADY EXISTS...');
                        reject("None")
                    }

                }).then(function(propertyres) {

                    const newShowPackage = session.create('Show_package', {
                        name: packageName,
                        parent_id: propertyres.id,
                        project_id: entity.id,
                    });

                    resp(newShowPackage); 

                    console.log(newShowPackage);

                })
                

            })
            .catch(function (error) {
                console.error('ERROR QUERYING PROJECT:', error);
                reject('ERROR QUERYING PROJECT:', error);
            });

    });

    

}

// CREATE NEW SHOT
function createShot(entity, prjid, shotName) {

    return new Promise(function (resolve, reject) {
        console.log(entity)
        session.query('select id, name from Shot where name is ' + shotName +' and parent_id is "' + entity.id + '"')
            .then(function (response) {
                
                return new Promise(function (resp, rej) {

                    if (response.data.length > 0) {

                        console.log('SHOT ALREADY EXISTS. PUSHING SHOT NAME TO LIST...');
                        
                        entityCheckObj[0].shot_id = response.data[0].id;
                        entityCheckObj[0].shot_name = response.data[0].name;
    
                        resp(response.data[0]);                    
                        
                    } else {
                        rej("None")
                    }
                }).then(function (ret) {

                    if (ret !== "None") {

                        resolve(ret);

                    } else {

                        // Fetch the entity (project, shot, or folder) you want to add the folder to
                        session.query('select id, name from TypedContext where id is "' + entity.id + '"')
                        .then(function (entityResponse) {
                            
                            if (entityResponse.data.length === 0) {
                                console.error('ENTITY NOT FOUND.');
                                reject('ENTITY NOT FOUND.');
                            }

                            const entity = entityResponse.data[0];

                            // CREATE NEW SHOT
                            const newShot = session.create('Shot', {
                                name: shotName,
                                parent_id: entity.id,
                                project_id: prjid,
                            }).then(function (res) {
                                
                                console.log(res)
                                resolve(res);
                                
                            });
                            
                        })
                        .catch(function (error) {
                            console.error('ERROR FETCHING ENTITY:', error);
                            reject('ERROR FETCHING ENTITY:', error);
                        });
                    }
                })
                .catch( () => {
                    // Fetch the entity (project, shot, or folder) you want to add the folder to
                    session.query('select id, name from TypedContext where id is "' + entity.id + '"')
                    .then(function (entityResponse) {
                        
                        if (entityResponse.data.length === 0) {
                            console.error('ENTITY NOT FOUND.');
                            reject('ENTITY NOT FOUND.');
                        }

                        const entity = entityResponse.data[0];

                        // CREATE NEW SHOT
                        const newShot = session.create('Shot', {
                            name: shotName,
                            parent_id: entity.id,
                            project_id: prjid,
                        }).then(function (res) {
                            
                            console.log(res)
                            resolve(res);
                            
                        });
                        
                    })
                    .catch(function (error) {
                        console.error('ERROR FETCHING ENTITY:', error);
                        reject('ERROR FETCHING ENTITY:', error);
                    });
                });

                
            })
            .catch(function (error) {
                console.error('ERROR QUERYING SHOT:', error);
                reject('ERROR QUERYING SHOT:', error);
            });

    });

    

}

// CREATE NEW COMP FOLDER
function createCmpFold(shotEntId, prjid, foldName) {

    return new Promise(function (resolve, reject) {

        session.query('select id, name from Folder where name is ' + foldName +' and parent_id is "' + shotEntId.id + '"')
            .then(function (response) {

                return new Promise(function (resp, rej) {
                    if (response.data.length > 0) {

                        console.log('FOLDER ALREADY EXISTS.');
                        console.log(response);
                        entityCheckObj[0].compfolder_id = response.data[0].id;
                        entityCheckObj[0].compfolder_name = foldName;
                        resp(response.data[0])
                    } else {
                        rej("None")
                    }
                }).then(function (ret) {

                    if (ret !== "None") {

                        resolve(ret)

                    } else {

                        console.log(shotEntId)
                        // FETCH PARENT ENTITY
                        session.query('select id, name from TypedContext where id is "' + shotEntId.id + '"')
                            .then(function (entityResponse) {
                                
                                if (entityResponse.length === 0) {
                                    console.error('ENTITY NOT FOUND.');
                                    reject('Entity not found.');
                                }

                                const entity = entityResponse.data[0];

                                // CREATE NEW SHOT
                                const newFold = session.create('Folder', {
                                    name: foldName,
                                    parent_id: entity.id,
                                    project_id: prjid,
                                }).then(function (res) {
                                    
                                    resolve(res);
                                    
                                });
                                
                            })
                            .catch(function (error) {
                                console.error('ERROR FETCHING ENTITY:', error);
                                reject('Error fetching entity:', error);
                            });
                    }
                    
                })
                .catch(() => {
                    console.log(shotEntId)
                    // FETCH PARENT ENTITY
                    session.query('select id, name from TypedContext where id is "' + shotEntId.id + '"')
                        .then(function (entityResponse) {
                            
                            if (entityResponse.length === 0) {
                                console.error('ENTITY NOT FOUND.');
                                reject('Entity not found.');
                            }

                            const entity = entityResponse.data[0];

                            // CREATE NEW SHOT
                            const newFold = session.create('Folder', {
                                name: foldName,
                                parent_id: entity.id,
                                project_id: prjid,
                            }).then(function (res) {
                                
                                resolve(res);
                                
                            });
                            
                        })
                        .catch(function (error) {
                            console.error('ERROR FETCHING ENTITY:', error);
                            reject('Error fetching entity:', error);
                        });
                });

            })
            .catch(function (error) {
                console.error('ERROR QUERYING FOLDER:', error);
                reject('Error querying folder:', error);
            });

    });

    

}

// CREATE NEW 3D FOLDER
function create3DFold(shotEntId, prjid, foldName) {

    return new Promise(function (resolve, reject) {

        session.query('select id, name from Folder where name is ' + foldName +' and parent_id is "' + shotEntId.id + '"')
            .then(function (response) {

                return new Promise(function (resp, rej) {

                    if (response.data.length > 0) {

                        console.log('Folder already exists.');
                        console.log(response);
                        entityCheckObj[0].threedfolder_id = response.data[0].id;
                        entityCheckObj[0].threedfolder_name = foldName;
                        resp(response.data[0]);

                    } else {

                        rej("None");

                    }

                }).then(function (ret) {

                    if (ret !== "None") {

                        resolve(ret)

                    } else {

                        // FETCH PARENT ENTITY
                        session.query('select id, name from TypedContext where id is "' + shotEntId.id + '"')
                        .then(function (entityResponse) {
                            
                            if (entityResponse.length === 0) {
                                console.error('ENTITY NOT FOUND.');
                                reject('Entity not found.');
                            }

                            const entity = entityResponse.data[0];

                            // CREATE NEW SHOT
                            const newFold = session.create('Folder', {
                                name: foldName,
                                parent_id: entity.id,
                                project_id: prjid,
                            }).then(function (res) {
                                
                                resolve(res);
                                
                            });
                            
                        })
                        .catch(function (error) {
                            console.error('ERROR FETCHING ENTITY:', error);
                            reject('Error fetching entity:', error);
                        });

                    }

                })
                .catch(() => {
                    // FETCH PARENT ENTITY
                    session.query('select id, name from TypedContext where id is "' + shotEntId.id + '"')
                    .then(function (entityResponse) {
                        
                        if (entityResponse.length === 0) {
                            console.error('ENTITY NOT FOUND.');
                            reject('Entity not found.');
                        }

                        const entity = entityResponse.data[0];

                        // CREATE NEW SHOT
                        const newFold = session.create('Folder', {
                            name: foldName,
                            parent_id: entity.id,
                            project_id: prjid,
                        }).then(function (res) {
                            
                            resolve(res);
                            
                        });
                        
                    })
                    .catch(function (error) {
                        console.error('ERROR FETCHING ENTITY:', error);
                        reject('Error fetching entity:', error);
                    });
                });


                

            })
            .catch(function (error) {
                console.error('ERROR QUERYING FOLDER:', error);
                reject('Error querying folder:', error);
            });

    });

    

}

// CREATE NEW TEAMS OBJ
function createTeamObj(foldEntId, prjid, teamsName) {

    return new Promise(function (resolve, reject) {
        console.log(foldEntId)
        session.query('select id, name from Teams where parent_id is "' + foldEntId.id + '"')
            .then(function (response) {

                return new Promise(function (resp, rej) {

                    if (response.data.length > 0) {

                        var theObj;
                        console.log(response.data);
                        for (var t=0; t <= response.data.length; t++) {

                            if (response.data[t].name == teamsName) {
                                theObj = response.data[t];
                                break;
                            }
                        }
    
                        if (foldEntId.name == "02_cmp") {
                            entityCheckObj[0].teamsobjectcmp_id = response.data[0].id;
                            entityCheckObj[0].teamsobjectcmp_name = response.data[0].name;
                        } else {
                            entityCheckObj[0].teamsobjectthrd_id = response.data[0].id;
                            entityCheckObj[0].teamsobjectthrd_name = response.data[0].name;
                        }
    
                        console.log(theObj);
                        resp(theObj);
                        
                        
                    } else {
                        rej("None")
                    }
                }).then(function (ret) {

                    if (ret == ERROR_MULTIPLE_TMS_OBJ){
                        throw new Error(ERROR_MULTIPLE_TMS_OBJ);
                    }
                    
                    if (ret !== "None") {

                        resolve(ret);

                    } else {

                        
                        // FETCH PARENT ENTITY
                        session.query('select id, name from TypedContext where id is "' + foldEntId.id + '"')
                            .then(function (entityResponse) {
                                
                                if (entityResponse.data.length === 0) {
                                    console.error('Entity not found.');
                                    reject('Entity not found.');
                                }
        
                                const entity = entityResponse.data[0];
        
                                // CREATE NEW SHOT
                                const newFold = session.create('Teams', {
                                    name: teamsName,
                                    parent_id: entity.id,
                                    project_id: prjid,
                                }).then(function (res) {
                                    
                                    resolve(res);
                                    
                                });
                                
                            })
                            .catch(function (error) {
                                console.error('ERROR FETCHING ENTITY:', error);
                                reject('Error fetching entity:', error);
                            });
                    }

                })
                .catch(function (args) {

                    if (args == ERROR_MULTIPLE_TMS_OBJ){
                        
                        console.error(ERROR_MULTIPLE_TMS_OBJ);
                        reject(ERROR_MULTIPLE_TMS_OBJ);
                        
                        
                    } else {

                        // FETCH PARENT ENTITY
                        session.query('select id, name from TypedContext where id is "' + foldEntId.id + '"')
                        .then(function (entityResponse) {
                            
                            if (entityResponse.data.length === 0) {
                                console.error('Entity not found.');
                                reject('Entity not found.');
                            }

                            const entity = entityResponse.data[0];

                            // CREATE NEW SHOT
                            const newFold = session.create('Teams', {
                                name: teamsName,
                                parent_id: entity.id,
                                project_id: prjid,
                            }).then(function (res) {
                                
                                resolve(res);
                                
                            });
                            
                        })
                        .catch(function (error) {
                            console.error('ERROR FETCHING ENTITY:', error);
                            reject('Error fetching entity:', error);
                        });

                    }

                    
                });
                

            })
            .catch(function (error) {
                
                console.error(error);
                reject(error);
                
                
            });

    });

    

}

// CREATE NEW COMP TASK
function createCompTask(parentEntId, prjid, currTaskName, typeid) {

    return new Promise(function (resolve, reject) {

        
        session.query('select id, name from Task where name is ' + currTaskName +' and parent_id is "' + parentEntId + '"')
        .then(function (response) {
            console.log(response);
            if (response.data.length > 0) {
                cmpTaskErrs.push(currTaskName);
                reject(ERROR_DUPE_TASK)
            }

            
            // FETCH PARENT ENTITY
            session.query('select id, name from TypedContext where id is "' + parentEntId + '"')
                .then(function (entityResponse) {
                    console.log(entityResponse)
                    if (entityResponse == ERROR_DUPE_TASK){
                        console.log(ERROR_DUPE_TASK);
                        cmpTaskErrs.push(currTaskName);
                        reject(ERROR_DUPE_TASK)
                    }
                    if (entityResponse.data.length === 0) {
                        console.log(ERROR_DUPE_TASK);
                        cmpTaskErrs.push(currTaskName);
                        reject(ERROR_DUPE_TASK);
                    }


                    const entity = entityResponse.data[0];

                    if (thumbnailwhitelist.includes(currTaskName)) {
                        var thmbNameJoin = currTaskName.toUpperCase() + "_THUMBNAIL";
                        session.query('select thumbnail_id from TypedContext where parent_id is "' + thumbResFold + '" and name is "' + thmbNameJoin + '"')

                        .then(function(data) {

                            if (data == ERROR_DUPE_TASK) {
                                reject(ERROR_DUPE_TASK);
                            }

                            console.log(data);
                            var tskThumbId = data.data[0].thumbnail_id
                            
                            //CREATE NEW TASK
                            const newFold = session.create('Task', {
                                name: currTaskName,
                                parent_id: entity.id,
                                project_id: prjid,
                                type_id: typeid,
                                thumbnail_id: tskThumbId
                            }).then(function (res) {

                                if (res == ERROR_DUPE_TASK) {
                                    reject(ERROR_DUPE_TASK);
                                }

                                resolve(res);
                                
                            })
                            .catch(function (error) {
                                console.error('Error duplicate task:', error);
                                reject(ERROR_DUPE_TASK)
                            });
                            
                        })
                        .catch(function (error) {
                            console.error('Error duplicate task:', error);
                            reject(ERROR_DUPE_TASK)
                        });

                    } else {

                        // CREATE NEW TASK
                        const newFold = session.create('Task', {
                            name: currTaskName,
                            parent_id: entity.id,
                            project_id: prjid,
                            type_id: typeid
                            })
                            .then(function (res) {

                                if (res == ERROR_DUPE_TASK) {
                                    reject(ERROR_DUPE_TASK);
                                }

                                resolve(res);
                                
                            })
                            .catch(function (error) {
                                console.error('Error duplicate task:', error);
                                reject(ERROR_DUPE_TASK)
                            });

                    }
                    
                })
                .catch(function (error) {
                    console.error('Error duplicate task:', error);
                    reject(ERROR_DUPE_TASK)
                });

        })
        .catch(function (error) {
            console.error('Error duplicate task:', error);
            reject(ERROR_DUPE_TASK)
        });

    });

    

}

// CREATE NEW 3D TASK
function create3DTask(parentEntId, prjid, currTaskName, typeid) {

    return new Promise(function (resolve, reject) {

        
        session.query('select id, name from Task where name is ' + currTaskName +' and parent_id is "' + parentEntId + '"')
        .then(function (response) {
            if (response.data.length > 0) {
                taskErrs.push(currTaskName);
                reject(ERROR_DUPE_TASK)
            }

            // FETCH PARENT ENTITY
            session.query('select id, name from TypedContext where id is "' + parentEntId + '"')
                .then(function (entityResponse) {
                    
                    if (entityResponse.data.length === 0) {
                        taskErrs.push(currTaskName);
                        reject(ERROR_DUPE_TASK)
                    }

                    if (entityResponse.data.length === 0) {
                        console.log(ERROR_DUPE_TASK);
                        cmpTaskErrs.push(currTaskName);
                        reject(ERROR_DUPE_TASK);
                    }

                    const entity = entityResponse.data[0];

                    var shotstxt = document.getElementById("mkshotstxt");
                    var adjTaskName;

                    if (shotstxt.classList.contains("makeshotstxtbright")) {
                        adjTaskName = currTaskName.split("_")[0];
                    }

                    if (thumbnailwhitelist.includes(currTaskName) || thumbnailwhitelist.includes(adjTaskName)) {

                        if (currTaskName.split("_").length > 1) {
                            var thmbNameJoin = adjTaskName.toUpperCase() + "_THUMBNAIL";
                        } else {
                            var thmbNameJoin = currTaskName.toUpperCase() + "_THUMBNAIL";
                        }
                        
                        session.query('select thumbnail_id from TypedContext where parent_id is "' + thumbResFold + '" and name is "' + thmbNameJoin + '"')
                        .then(function(data) {
                            
                            if (data == ERROR_DUPE_TASK) {
                                reject(ERROR_DUPE_TASK);
                            }

                            var tskThumbId = data.data[0].thumbnail_id
                            
                            //CREATE NEW TASK
                            const newFold = session.create('Task', {
                                name: currTaskName,
                                parent_id: entity.id,
                                project_id: prjid,
                                type_id: typeid,
                                thumbnail_id: tskThumbId
                            })
                            .then(function (res) {

                                if (res == ERROR_DUPE_TASK) {
                                    reject(ERROR_DUPE_TASK);
                                }

                                resolve(res);
                                
                            })
                            .catch(function (error) {
                                console.error('Error duplicate task:', error);
                                reject(ERROR_DUPE_TASK)
                            });
                            
                        })
                        .catch(function (error) {
                            console.error('Error duplicate task:', error);
                            reject(ERROR_DUPE_TASK)
                        });

                    } else {

                        // CREATE NEW SHOT
                        const newFold = session.create('Task', {
                            name: currTaskName,
                            parent_id: entity.id,
                            project_id: prjid,
                            type_id: typeid
                        })
                        .then(function (res) {
                            
                            if (res == ERROR_DUPE_TASK) {
                                reject(ERROR_DUPE_TASK);
                            }
                            
                            resolve(res);
                            
                        })
                        .catch(function (error) {
                            console.error('Error duplicate task:', error);
                            reject(ERROR_DUPE_TASK)
                        });

                    }

                    
                    
                })
                .catch(function (error) {
                    console.error('Error duplicate task:', error);
                    reject(ERROR_DUPE_TASK)
                });

        })
        .catch(function (error) {
            console.error('Error duplicate task:', error);
            reject(ERROR_DUPE_TASK)
        });

    });

    

}

async function processCompTasks(compArr, entOBJ, projID, tasktype) {

    if (entOBJ != "None") {

        for (var x=0; x < compArr.length; x++) {

            await createCompTask(entOBJ.id, projID, compArr[x], tasktype)
            .then(taskItemEnt => {
                console.log("Item " + taskItemEnt.data.name + " successfully added.")
            }).catch((errTask) => {
                cmpTaskErrs.push(errTask);
            });
    
        }


        
        console.log("ALL COMP ITEMS HAVE BEEN PROCESSED")
    } else {
        //DO NOTHING
    }
    

}

async function process3DTasks(thrDArr, entOBJ, projID, tasktype) {

    if (entOBJ != "None") {

        for (var x=0; x < thrDArr.length; x++) {

            await create3DTask(entOBJ.id, projID, thrDArr[x], tasktype)
            .then(taskItemEnt => {
                console.log("Item " + taskItemEnt.data.name + " successfully added.")
            }).catch((errTask) => {
                thrDTaskErrs.push(errTask);
            });
    
        }
        
        console.log("ALL 3D ITEMS HAVE BEEN PROCESSED");
    } else {
        //DO NOTHING
    }
    
    

}

function checkEmptyRows() {

    return new Promise(function (resolve, reject) {

        // var cmptable = document.getElementById("comptablebody");
        // var thdtable = document.getElementById("threedtablebody");

        // var cmptggle = document.getElementById("compswitch");
        // var threedtggle = document.getElementById("threedswitch");
        

        // if (cmptggle.classList.contains("toggle-on")){

        //     for (var i = cmptable.rows.length-1; i >= 1; i--) {
        //         var currrow = cmptable.rows[i];
        //         var rwchild = currrow.children[0].children[0];
                

        //         if (rwchild.innerHTML.length == 0) {
        //             currrow.remove();
        //         }

        //     }
        // }

        // if (threedtggle.classList.contains("toggle-on")){

        //     for (var j = thdtable.rows.length-1; j >= 1; j--) {
        //         var currtdrow = thdtable.rows[j];
        //         var rwtdchild = currtdrow.children[0].children[0];

        //         if (rwtdchild.innerHTML.length == 0) {
        //             currtdrow.remove();
        //         }

        //     }
        // }

        resolve(true)
    });
    

}

function checkToggles() {

    return new Promise(function (resolve, reject) {

        var cmptggle = document.getElementById("compswitch");
        var threedtggle = document.getElementById("threedswitch");
        var multitggle = document.getElementById("standaloneswitch");
        var multifield = document.getElementById("standalonefield");
        

        if (multitggle.classList.contains("toggle-on") && multifield.value.length == 0) {
            //THROW ERROR HERE OR TOGGLE OFF
            reject(ERROR_MISSING_MULTICOMP)
        }

        if (threedtggle.classList.contains("toggle-on")) {
            if (document.getElementById("threedtablebody").rows.length == 0) {
                threedtggle.click();
                // toggleVis3DTasks();
                
            }
        }

        if (cmptggle.classList.contains("toggle-on")) {
            if (document.getElementById("comptablebody").rows.length == 0) {
                cmptggle.click();
                // toggleVisCompTasks();
            }
        }

        resolve(true) 
    });
    


}

function checkShotStructure() {

    return new Promise(function (resolve, reject) {

        var shottitle = document.getElementById("searchbar");
        var splittitle = shottitle.value.split("_");

        if (splittitle.length <= 1) {
            //THROW ERROR FOR IMPROPER STRUCTURE
            reject(ERROR_SHORT_TITLE)
        }

        if (parseInt(splittitle[0]) == NaN) {
            //THROW ERROR FOR NUMBER
            reject(ERROR_NOTNUM)
        }

        var prefixlen = splittitle[0].split("").length;
        if (prefixlen !== 4) {
            reject(ERROR_NOTNUM)
        }

        resolve(true)
    });

    
}

function triggerRiveStart(){
    var rc = document.getElementById("rivcontainer");
    rc.classList.add("rive-cont-on");
    rc.classList.remove("rive-cont-off");

    //INIT RIVE ANIM
    txtActionLoops("RunLoopA", 1);
    txtActionLoops("RunLoopB", 2);
    fireAnim("startAnim");
}

function blurBGElements() {
    //GET UI CONTAINERS AND DEFOCUS
    var mc = document.getElementById("maincontainer");
    var sc = document.getElementById("secondarycontainer");
    var spcr = document.getElementById("spacer");

    mc.classList.add("main-container-blur");
    sc.classList.add("secondary-container-blur");
    spcr.classList.add("linesep-blur");
}

function triggerFailure(theerror) {

    adjustTxtRuntimes("RunError", theerror);
    adjustTxtRuntimes("RunSuccess", "Tasks Need Attention");
    
    
    setTimeout(function() {
        fireAnim("stopAnim");
        fireAnim("sendErr");
    }, 2000);
}