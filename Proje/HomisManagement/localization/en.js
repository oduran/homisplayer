var Localization = 
{
	userNotFoundError : "User not found.",
  noPermissionError : "You have no permision to do this.",
	wrongPasswordError : "Wrong password.",
  newUserPasswordRequiredError : "New user should have password.",
  passwordLengthError : "Password should have at least 6 characters.",
  passwordEmptyError : "Password cannot be empty.",
  nameEmptyError : "User name cannot be empty.",
  noWorkspaceError : "There is no workspace for this user.",
  noAccessTokenError : "You have no permission to access.",
  workspaceNotFoundError : "There is no workspace with given id for this user.",
  playerAlreadyExistError: "Player name is already registered.",
  valid : "valid",
  success : "Operation successful.",
  working : "Working."
}

if(module)
{
  module.exports = 
  {
    Localization : Localization
  };  
}