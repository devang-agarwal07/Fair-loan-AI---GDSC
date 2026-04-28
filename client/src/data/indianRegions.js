/**
 * Indian States, Union Territories and their major districts.
 * Used for the region selector dropdown with search.
 */
const INDIAN_REGIONS = {
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'West Kameng', 'East Kameng', 'Papum Pare', 'Lower Subansiri', 'Upper Subansiri', 'West Siang', 'East Siang', 'Changlang'],
  'Assam': ['Baksa', 'Barpeta', 'Cachar', 'Darrang', 'Dhubri', 'Dibrugarh', 'Goalpara', 'Golaghat', 'Jorhat', 'Kamrup', 'Karbi Anglong', 'Kokrajhar', 'Nagaon', 'Sivasagar', 'Sonitpur', 'Tinsukia'],
  'Bihar': ['Araria', 'Aurangabad', 'Begusarai', 'Bhagalpur', 'Buxar', 'Darbhanga', 'Gaya', 'Gopalganj', 'Katihar', 'Kishanganj', 'Madhubani', 'Muzaffarpur', 'Nalanda', 'Patna', 'Purnia', 'Samastipur', 'Saran', 'Sitamarhi', 'Siwan', 'Vaishali'],
  'Chhattisgarh': ['Bastar', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Janjgir-Champa', 'Jashpur', 'Kanker', 'Korba', 'Mahasamund', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Surguja'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Dahod', 'Gandhinagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Narmada', 'Panchmahal', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Vadodara', 'Valsad'],
  'Haryana': ['Ambala', 'Bhiwani', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kullu', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
  'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Madhya Pradesh': ['Balaghat', 'Betul', 'Bhopal', 'Chhindwara', 'Damoh', 'Dewas', 'Dhar', 'Gwalior', 'Hoshangabad', 'Indore', 'Jabalpur', 'Katni', 'Mandla', 'Morena', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Shajapur', 'Ujjain', 'Vidisha'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur', 'Nanded', 'Nashik', 'Osmanabad', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Vidarbha', 'Wardha', 'Washim', 'Yavatmal'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Senapati', 'Tamenglong', 'Thoubal', 'Ukhrul'],
  'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
  'Mizoram': ['Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip'],
  'Nagaland': ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Keonjhar', 'Khordha', 'Koraput', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'SAS Nagar', 'SBS Nagar', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukottai', 'Ramanathapuram', 'Salem', 'Sivagangai', 'Thanjavur', 'Theni', 'Tiruchirappalli', 'Tirunelveli', 'Tiruvannamalai', 'Tuticorin', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Hyderabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Medak', 'Nalgonda', 'Nizamabad', 'Rangareddy', 'Warangal'],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Bahraich', 'Ballia', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hardoi', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur', 'Kushinagar', 'Lakhimpur Kheri', 'Lucknow', 'Maharajganj', 'Mainpuri', 'Mathura', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Rae Bareli', 'Rampur', 'Saharanpur', 'Shahjahanpur', 'Sitapur', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Bankura', 'Birbhum', 'Burdwan', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Medinipur', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'],
  'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North West Delhi', 'South Delhi', 'South West Delhi', 'West Delhi'],
  'Jammu and Kashmir': ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
  'Ladakh': ['Kargil', 'Leh'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
  'Andaman and Nicobar': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
  'Dadra and Nagar Haveli': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
  'Lakshadweep': ['Lakshadweep'],
};

export default INDIAN_REGIONS;
