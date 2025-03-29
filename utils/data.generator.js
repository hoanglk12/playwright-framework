const { faker } = require('@faker-js/faker');
class DataGenerator {
  constructor() {
    this.emailDomains = [
        'gmail.com', 
        'outlook.com', 
        'yahoo.com', 
        'hotmail.com', 
        'company.com',
        'test.com',
        'example.com'
    ];
}
generateEmail() {
  const prefixOptions = [
      `user_${this.generateRandomString(8)}`,
      `test_${this.generateRandomString(6)}`,
      `qa_${this.generateRandomString(7)}`,
      `${this.generateRandomString(10)}`
  ]

  const randomPrefix = prefixOptions[Math.floor(Math.random() * prefixOptions.length)];
  const randomDomain = this.emailDomains[Math.floor(Math.random() * this.emailDomains.length)];

  return `${randomPrefix}@${randomDomain}`.toLowerCase();
  
}



    // static generateLoginCredentials() {
    //   return {
    //     username: `user_${this.generateRandomString(8)}`,
    //     password: this.generateRandomString(12)
    //   };
    // }
  static generateUser() {
      return {
        name: faker.person.fullName(),
        job: faker.person.jobTitle(),
        //email: faker.internet.email(),
        //avatar: faker.image.avatar()
      };
    }
  static generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }
  static generateFullName() {
      const firstNames = ['John', 'Jane', 'Mike', 'Emily', 'David', 'Sarah'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      return `${firstName} ${lastName}`;
  }

  static generateJobTitle() {
      const jobTitles = [
          'Software Engineer',
          'Product Manager',
          'Data Analyst',
          'UX Designer',
          'Marketing Specialist',
          'Sales Representative',
          'Quality Assurance Engineer'
      ];

      return jobTitles[Math.floor(Math.random() * jobTitles.length)];
  }

  static generatePassword() {
      // Generate a strong password
      const length = 12;
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let password = '';
      
      // Ensure at least one of each type of character
      password += charset.charAt(Math.floor(Math.random() * 26)); // lowercase
      password += charset.charAt(Math.floor(Math.random() * 26) + 26); // uppercase
      password += charset.charAt(Math.floor(Math.random() * 10) + 52); // number
      password += charset.charAt(Math.floor(Math.random() * 10) + 62); // special char

      // Fill the rest of the password
      for (let i = 4; i < length; i++) {
          password += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      // Shuffle the password
      return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
    static generateLoginCredentials() {
      return {
          email: faker.internet.email(),
          //name: this.faker.generateFullName(),
          //job: this.generateJobTitle(),
          password: faker.internet.password()
      };
    }
  }

 
  
  module.exports = DataGenerator;
  