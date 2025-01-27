
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

function preFlightPackageElement() {

    var pkgsearchbar = document.getElementById("packagesearchbar");
    var pkgentry = pkgsearchbar.value;
    var pkgname;


    //CHECKING SHOW PACKAGE SEARCHBAR VALUE
    if (pkgentry.length == 0 || pkgentry == "") {
        return false
    } else {
        pkgname = pkgentry;
    }

    return pkgname


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

    var namecheck = preFlightComboElement();

    if (namecheck !== false) {

        var comboNameArray = namecheck;

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

    } else {
        return
    }
    

}

function createPackageSolo() {

    
    //CREDENTIALS AND SESSION
    var creds = window.credentials;
    console.debug(creds);

    session = new ftrack.Session(
        creds.serverUrl,
        creds.apiUser,
        creds.apiKey
    );

    var namecheck = preFlightPackageElement();

    if (namecheck !== false) {

        var thepkg = namecheck;

        //GETTING BASE ENTITY
        var entity = ftrackWidget.getEntity();
        console.log(entity);

        session.query('select project_id from Property where id is ' + entity.id +'')
        .then(function (response) {

                //ESTABLISHING VARS FOR CREATED ENTITIES
                console.log(response);

                if (response.data.length > 0) {

                    var currprjid = response.data[0].project_id;

                    var packageName = thepkg;
                
                
                    //PROMISE CHAIN FUNCTIONS
                    function packageItemPromise() {
                        
                        return new Promise(function(resolve,reject) {
        
                            createPackage(entity, packageName, currprjid)
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
                    packageItemPromise().then(function(res) {
        
                        console.log(res);
                        
                    })

                }
                
        })

        
    } else {
        return
    }
    

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

                        
                        resp(newProperty)
                        
    
                    } else {
                        console.log('Property ALREADY EXISTS...');
                        reject("None")
                    }

                }).then(function(propertyres) {

                    return new Promise(function (rsp, rjct) {
                        
                        
                        const newShowPackage = session.create('Show_package', {
                            name: packageName,
                            parent_id: propertyres.data.id,
                            project_id: entity.id,
                        });

                        
                        
                        console.log(newShowPackage);
                        rsp(newShowPackage); 

                    }).then(function(packageres) {

                        console.log(packageres);
                        console.log(packageres.data.id);

                        const newProduction = session.create('Production', {
                            name: '03_brdcast_gfx',
                            parent_id: packageres.data.id,
                            project_id: entity.id,
                        })

                        console.log(newProduction);
                        resolve(newProduction)

                    })

                })
                

            })
            .catch(function (error) {
                console.error('ERROR QUERYING PROJECT:', error);
                reject('ERROR QUERYING PROJECT:', error);
            });

    });

    

}

// CREATE NEW PROPERTY
function createPackage(entity, packageName, prjid) {

    return new Promise(function (resolve, reject) {

        console.log(entity)
        session.query('select name from Show_package where name is ' + packageName +' and parent_id is "' + entity.id + '"')
            .then(function (response) {
                
                console.log(response);

                return new Promise(function (resp, rej) {

                    if (response.data.length == 0) {

                        const newPackage = session.create('Show_package', {
                            name: packageName,
                            parent_id: entity.id,
                            project_id: prjid,
                        });

                        
                        resp(newPackage)
                        
    
                    } else {
                        console.log('Property ALREADY EXISTS...');
                        reject("None")
                    }

                }).then(function(packageres) {

                    const newProduction = session.create('Production', {
                        name: '03_brdcast_gfx',
                        parent_id: packageres.data.id,
                        project_id: prjid,
                    })

                    console.log(newProduction);
                    resolve(newProduction); 

                })
                

            })
            .catch(function (error) {
                console.error('ERROR QUERYING PROJECT:', error);
                reject('ERROR QUERYING PROJECT:', error);
            });

    });

    

}

