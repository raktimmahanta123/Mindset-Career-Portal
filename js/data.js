/* ===========================================================
   MINDSET — Seed Data (Assam-flavoured)
   =========================================================== */

const SEED_EMPLOYERS = [
  { company: "Brahmaputra Logistics Pvt. Ltd.", person: "Bhaskar Jyoti Saikia",   designation: "HR Manager",             phone: "+91 98640 12398", state: "Assam", district: "Kamrup Metro", town: "Guwahati",    remark: "Looking for 5 drivers and 2 accountants.",                   status: "active"  },
  { company: "Luit Textiles & Weaves",          person: "Nabanita Hazarika",      designation: "Director",               phone: "+91 97070 45512", state: "Assam", district: "Jorhat",       town: "Jorhat",      remark: "Hiring loom operators on contract basis.",                   status: "active"  },
  { company: "Dihing Tea Estate",               person: "Pranab Gogoi",            designation: "Estate Manager",         phone: "+91 98540 77231", state: "Assam", district: "Dibrugarh",    town: "Tinsukia",    remark: "Seasonal hiring — plucking & field supervisors.",            status: "active"  },
  { company: "Kaziranga Hospitality Group",     person: "Rituparna Baruah",        designation: "GM – People Ops",        phone: "+91 96780 33109", state: "Assam", district: "Golaghat",     town: "Kaziranga",   remark: "Front desk, chefs, housekeeping urgently required.",         status: "active"  },
  { company: "North-East Pharma Distributors",  person: "Arup Kumar Das",          designation: "Branch Head",            phone: "+91 94355 00981", state: "Assam", district: "Kamrup Metro", town: "Guwahati",    remark: "Field sales executives, 10 positions open.",                 status: "active"  },
  { company: "Rongali Auto Works",              person: "Mridul Phukan",           designation: "Proprietor",             phone: "+91 86389 22157", state: "Assam", district: "Nagaon",       town: "Nagaon",      remark: "Requires mechanics and a service-centre receptionist.",       status: "active"  },
  { company: "Shankardev Academy Trust",        person: "Dr. Indrani Bora",        designation: "Admin Officer",          phone: "+91 95771 40088", state: "Assam", district: "Barpeta",      town: "Barpeta",     remark: "Math & Science teachers on priority. Panel interview this month.", status: "active" },
  { company: "Majuli Organic Foods",            person: "Himanshu Pegu",           designation: "Operations Lead",         phone: "+91 90852 18877", state: "Assam", district: "Majuli",       town: "Garmur",      remark: "Packaging & logistics staff; willing to train freshers.",     status: "active"  },
  { company: "Dispur IT Solutions",             person: "Anushka Chakraborty",     designation: "HR Business Partner",     phone: "+91 99540 62210", state: "Assam", district: "Kamrup Metro", town: "Guwahati",    remark: "Jr. developers, QA testers and a UI designer.",               status: "active"  },
  { company: "Silchar Steel Traders",           person: "Ramen Deb",                designation: "Partner",                phone: "+91 94350 98712", state: "Assam", district: "Cachar",       town: "Silchar",     remark: "Inventory clerks + one tally-accountant.",                    status: "active"  },
  { company: "Bihu Retail Chain",               person: "Jonali Kalita",            designation: "Store Operations",       phone: "+91 98640 55721", state: "Assam", district: "Kamrup Metro", town: "Guwahati",    remark: "Cashiers & floor staff across 4 outlets.",                    status: "active"  },
  { company: "Assam Agro Equipments",           person: "Dhiraj Nath",              designation: "Director",               phone: "+91 90853 11098", state: "Assam", district: "Sonitpur",     town: "Tezpur",      remark: "Field demonstrators with two-wheeler + licence.",              status: "archived" },
  { company: "Meghalaya Cement Co.",             person: "Kyrsoi Lyngdoh",           designation: "HR Executive",           phone: "+91 87947 21087", state: "Meghalaya", district: "East Khasi Hills", town: "Shillong", remark: "Looking for plant operators and safety officers.",         status: "active"  },
  { company: "Tawang Adventures Ltd.",           person: "Tenzing Monpa",            designation: "Founder",                phone: "+91 94021 67781", state: "Arunachal Pradesh", district: "Tawang", town: "Tawang", remark: "Trek guides & drivers (4WD licence required).",              status: "active"  },
  { company: "Ujjayini Marketing Collective",    person: "Gitartha Sarma",            designation: "Account Director",       phone: "+91 83991 78820", state: "Assam", district: "Kamrup Metro", town: "Guwahati",    remark: "Content writers, designers, junior account execs.",           status: "active"  }
];

const SEED_EMPLOYEES = [
  { name: "Rituraj Borgohain",       dept: "Accounts & Finance",    designation: "Accountant",            phone: "+91 98642 00127", state: "Assam", district: "Kamrup Metro", town: "Guwahati",   remark: "Completed B.Com, 2 yrs exp at Dispur IT. Ready for interview.",   status: "paid",  txn: "UPI8239KD019" },
  { name: "Anjalika Sonowal",         dept: "Human Resources",       designation: "HR Executive",          phone: "+91 97079 33211", state: "Assam", district: "Jorhat",       town: "Jorhat",     remark: "MBA fresher; shortlisted by Brahmaputra Logistics.",               status: "paid",  txn: "PGW39012KK"   },
  { name: "Bhargav Jyoti Das",        dept: "Hospitality",           designation: "Front Desk Executive",  phone: "+91 94350 71106", state: "Assam", district: "Golaghat",     town: "Kaziranga",  remark: "Hotel management diploma, fluent English + Assamese.",              status: "paid",  txn: "UPI12KK9910"  },
  { name: "Priyam Kashyap",            dept: "IT & Software",         designation: "Junior Developer",      phone: "+91 96780 88001", state: "Assam", district: "Kamrup Metro", town: "Guwahati",   remark: "Node.js + React. Portfolio submitted.",                              status: "paid",  txn: "TXN77812JD"   },
  { name: "Neelakshi Medhi",           dept: "Education",             designation: "Math Teacher",          phone: "+91 98540 21190", state: "Assam", district: "Barpeta",      town: "Barpeta",    remark: "Demo class taken at Shankardev Academy — feedback positive.",      status: "paid",  txn: "UPI4411LLX"   },
  { name: "Tridib Kumar Nath",          dept: "Logistics",             designation: "Driver (HCV)",          phone: "+91 87946 12307", state: "Assam", district: "Nagaon",       town: "Nagaon",     remark: "12 years exp., valid HCV licence, clean record.",                    status: "paid",  txn: "UPI78HG811"   },
  { name: "Lopamudra Rabha",           dept: "Marketing",             designation: "Content Writer",        phone: "+91 99540 10098", state: "Assam", district: "Kamrup Metro", town: "Guwahati",   remark: "Strong Assamese + English. Portfolio reviewed by Ujjayini.",         status: "paid",  txn: "TXN30021ML"   },
  { name: "Mrinmoy Kakoti",            dept: "Sales",                 designation: "Field Sales Executive", phone: "+91 90851 66520", state: "Assam", district: "Dibrugarh",    town: "Tinsukia",   remark: "Open to pharma field role. Own two-wheeler.",                       status: "paid",  txn: "PGW9912KMK"   },
  { name: "Bhaswati Chakraborty",      dept: "Retail",                designation: "Cashier",                phone: "+91 86389 34421", state: "Assam", district: "Kamrup Metro", town: "Guwahati",   remark: "Previous exp. at a supermarket; speaks 3 regional languages.",        status: "paid",  txn: "UPI12CB8710"  },
  { name: "Partha Pratim Sharma",      dept: "Estate Operations",     designation: "Field Supervisor",       phone: "+91 94022 11290", state: "Assam", district: "Dibrugarh",    town: "Dibrugarh",  remark: "Tea estate exp. 6 yrs, fluent in Bagania & Assamese.",               status: "paid",  txn: "UPI1100PP2"   },
  { name: "Hirakjyoti Bhuyan",          dept: "IT & Software",         designation: "QA Tester",              phone: "+91 98641 88219", state: "Assam", district: "Kamrup Metro", town: "Guwahati",   remark: "Manual + automation testing. Selenium, Postman.",                    status: "pending", txn: "" },
  { name: "Debashree Goswami",         dept: "Healthcare",            designation: "Lab Technician",         phone: "+91 83990 55123", state: "Assam", district: "Cachar",       town: "Silchar",    remark: "DMLT diploma. Willing to relocate within NE.",                        status: "paid",  txn: "UPI4411DG8"   },
  { name: "Sanjukta Baruah",           dept: "Hospitality",           designation: "Housekeeping Supervisor", phone: "+91 97073 10002", state: "Assam", district: "Kamrup Metro", town: "Guwahati",   remark: "Hotel Taj exp. 4 yrs. Available immediately.",                        status: "paid",  txn: "UPI55SB71"    },
  { name: "Utpal Talukdar",            dept: "Construction",          designation: "Site Engineer",           phone: "+91 96780 22110", state: "Assam", district: "Sonitpur",     town: "Tezpur",     remark: "Civil engineer, 5 yrs, bridge & building projects.",                  status: "paid",  txn: "TXN881UT99"   },
  { name: "Ankita Brahma",             dept: "Design",                designation: "UI Designer",             phone: "+91 95771 44012", state: "Assam", district: "Kokrajhar",    town: "Kokrajhar",  remark: "Figma, strong visual portfolio. Dispur IT interested.",              status: "paid",  txn: "UPI99AB120"   },
  { name: "Rohit Kurmi",                dept: "Mechanical",            designation: "Mechanic",                phone: "+91 87947 66310", state: "Assam", district: "Nagaon",       town: "Nagaon",     remark: "ITI + 8 yrs at Rongali Auto. Looking for upgrade.",                  status: "paid",  txn: "UPI91RK430"   },
  { name: "Manashi Daimari",            dept: "Education",             designation: "Science Teacher",         phone: "+91 98642 33119", state: "Assam", district: "Barpeta",      town: "Barpeta",    remark: "M.Sc Physics, prior govt. school experience.",                        status: "paid",  txn: "UPI44MD321"   },
  { name: "Jyotishman Kalita",          dept: "Agriculture",           designation: "Demo Executive",          phone: "+91 90855 11998", state: "Assam", district: "Sonitpur",     town: "Tezpur",     remark: "Own bike + licence. Field visits OK.",                                status: "pending", txn: "" },
  { name: "Dipanwita Chetia",           dept: "Accounts & Finance",    designation: "Tally Accountant",        phone: "+91 83991 80021", state: "Assam", district: "Cachar",       town: "Silchar",    remark: "Tally ERP + GST filing exp.",                                         status: "paid",  txn: "UPI50DC712"   },
  { name: "Kaustav Choudhury",          dept: "Travel & Tourism",       designation: "Trek Guide",              phone: "+91 94022 55709", state: "Arunachal Pradesh", district: "Tawang", town: "Tawang", remark: "Certified guide, Hindi + English + Monpa.",                        status: "paid",  txn: "TXN9923KC"    }
];

const SEED_LOGS = [
  { t: Date.now() - 1000 * 60 * 18,     user: "Admin",  action: "added new employee",   target: "Rituraj Borgohain"     },
  { t: Date.now() - 1000 * 60 * 47,     user: "PO 01",  action: "updated remark on",    target: "Dihing Tea Estate"     },
  { t: Date.now() - 1000 * 60 * 140,    user: "Admin",  action: "verified transaction", target: "Neelakshi Medhi"       },
  { t: Date.now() - 1000 * 60 * 60 * 5, user: "PO 01",  action: "archived record",      target: "Assam Agro Equipments" },
  { t: Date.now() - 1000 * 60 * 60 * 19,user: "Admin",  action: "exported report",      target: "Employers CSV"         },
  { t: Date.now() - 1000 * 60 * 60 * 28,user: "PO 02",  action: "added new employer",   target: "Tawang Adventures Ltd."},
  { t: Date.now() - 1000 * 60 * 60 * 52,user: "Admin",  action: "edited contact",       target: "Kaziranga Hospitality" },
  { t: Date.now() - 1000 * 60 * 60 * 72,user: "PO 01",  action: "issued receipt",       target: "Bhargav Jyoti Das"     }
];

const DEPARTMENTS = [
  "Accounts & Finance","Human Resources","Sales","Marketing","IT & Software",
  "Hospitality","Logistics","Retail","Education","Healthcare","Design",
  "Construction","Mechanical","Agriculture","Travel & Tourism","Estate Operations"
];

const STATES = ["Assam","Meghalaya","Arunachal Pradesh","Nagaland","Manipur","Mizoram","Tripura","West Bengal"];

window.SEED = { SEED_EMPLOYERS, SEED_EMPLOYEES, SEED_LOGS, DEPARTMENTS, STATES };
