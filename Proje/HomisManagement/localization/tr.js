var Localization = 
{
	userNotFoundError : "Kullanıcı bulunamadı.",
  noPermissionError : "Bunu yapmaya yetkiniz bulunmamaktadır.",
	wrongPasswordError : "Yanlış şifre.",
  newUserPasswordRequiredError : "Yeni kullanıcının şifresi olmalıdır",
  passwordLengthError : "Şifre en az 6 karakter olmalıdır.",
  passwordEmptyError : "Şifre boş bırakılamaz",
  nameEmptyError : "Kullanıcı ismi boş bırakılamaz.",
  noWorkspaceError : "Bu kullanıcı için herhangi bir çalışma alanı oluşturulmamış.",
  noAccessTokenError : "Erişim hakkınız yok.",
  workspaceNotFoundError : "Bu kullanıcı için verilen id ile çalışma alanı mevcut değil.",
  playerAlreadyExistError: "Oynatıcı ismi zaten kayıtlı",
  valid : "geçerli",
  success : "İşlem başarıyla gerçekleştirildi.",
  working : "Çalışıyor."
}

if(module)
{
  module.exports = 
  {
    Localization : Localization
  };  
}

