# Used to write in csv format
import csv
# Used to load web data
from selenium import webdriver

# Credits: https://towardsdatascience.com/web-scraping-html-tables-with-python-c9baba21059
# https://stackoverflow.com/questions/56090905/is-there-a-way-to-get-information-about-elements-from-the-inspect-menu-in-a-webs

# Connects to chrome requires chromedriver
d = webdriver.Chrome('/home/max/pygems/chromedriver')
# Gets website in chrome
d.get('https://www.worldometers.info/coronavirus/')
# Saves table element
table = d.find_element_by_css_selector('#main_table_countries')
# Parses data within table rows
rows = table.find_elements_by_xpath('//tr')

# Prevents infinite loop
row = rows[0]
# Gets each country
col = row.find_elements_by_xpath('//td')

# 
row_hold = []

# Gets and processes text from element on table
def extract_text(element):
    # Extracts text from web element removing commas and pluses
    text = element.text.replace(",","").replace("+","")
    # Checks if there is no text present indicating 0
    if text == "":
        text = 0
    return text

# Merge the Japan and Diamond Princess 
def merge_diamond_princess(row_elements):
    global row_hold
    # Extracts country name from array
    country = row_elements[0]
    # Checks if we're processing the Diamond Princess case
    if country == "Diamond Princess" or country == "Japan":
        # Checks if we are holding a row already
        if row_hold:
            # Sets the country as Japan
            row_hold[0] = "Japan"
            i = 1
            # Runs through all but the first element
            while i < len(row_elements):
                # Adds each cell to the value of held row
                row_elements[i] += row_hold[i]
                i += 1
        else:
            # Copies the elements to be held for the next iteration
            row_hold = row_elements.copy()
            # Prevents row_elements from being added to file
            return True
    return False

def remove_total(row_elements):
    if row_elements[0] == "Total:":
        # Prevents row_elements from being added to file
        return True
    return False

def special_rows(row_elements):
    # Checks if the row shouldn't be added to the file
    if remove_total(row_elements) or merge_diamond_princess(row_elements):
        pass
    else:
        print(row_elements)
        # Writes row to file
        writer.writerow(row_elements)

# Opens the csv file to write to
with open('coronaCountries', 'w', newline='') as file:
    # Opens the writer
    writer = csv.writer(file)
    # Writes the title row
    writer.writerow(["Country", "Total Cases", "New Cases", "Total Deaths", "New Deaths", "Total Recovered", "Serious"])
    # Creates blank list to store each row element
    row_elements = []
    # Stores how many elements we have encountered on the row
    counter = 0
    # Counts through each element in the table
    for element in col:
        # Gets and processes text from element on table
        text = extract_text(element)
        if counter == 0:
            # Appends text to list
            row_elements.append(text)
        else:
            # Appends text to list
            row_elements.append(int(text))
        # Checks if we've reached the end of the row
        if counter == 7:
            # 
            special_rows(row_elements)
            # Clears list
            row_elements.clear()
            # Resets counter
            counter = 0
        else:
            # Increments counter
            counter += 1