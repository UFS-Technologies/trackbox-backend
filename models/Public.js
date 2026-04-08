const {executeTransaction} = require('../helpers/sp-caller');


const Public = {
    
    Get_All_Menu: async function() {
        console.log('executeTransaction: ',);
        return executeTransaction('Get_All_Menu', [ ]);
    },
    Check_App_Version: async function(version) {
        return executeTransaction('Check_App_Version', [ version]);
    },
    deactivate_Account: async function(details) {
        console.log('details: ', details);
        return executeTransaction('deactivate_Account', [ details.mobileNumber]);
    },
    Get_AppPosters: async function() {
        return executeTransaction('Get_AppPosters', [ ]);
    },
    Save_AppPoster: async function(poster) {
        return executeTransaction('Save_AppPoster', [ 
            poster.id || 0, 
            poster.title, 
            poster.image_path, 
            poster.link_url, 
            poster.is_active 
        ]);
    },
    Delete_AppPoster: async function(id) {
        return executeTransaction('Delete_AppPoster', [ id ]);
    },
}
module.exports = Public;