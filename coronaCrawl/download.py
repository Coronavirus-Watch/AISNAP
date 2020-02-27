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
table = d.find_element_by_css_selector('#table3')
# Parses data within table rows
rows = table.find_elements_by_xpath('//tr')

# Prevents infinite loop
row = rows[0]
# Gets each country
col = row.find_elements_by_xpath('//td')

# Opens the csv file to write to
with open('coronaCountries', 'w', newline='') as file:
    # Opens the writer
    writer = csv.writer(file)
    # Writes the title row
    writer.writerow(["Country", "Total Cases", "New Cases", "Total Deaths", "New Deaths", "Total Recovered", "Serious"])
    # Creates blank list to storeeach row element
    rowElementList = []
    # Stores how many elements we have encountered on the row
    counter = 0
    # Counts through each element in the row
    for element in col:
        # Extracts text from web element removing commas and pluses
        text = element.text.replace(",","").replace("+","")
        # Checks if there is no text present indicating 0
        if text == "":
            text = 0
        # Appends text to list
        rowElementList.append(text)
        # Checks if we've reached the end of the row
        if counter == 7:
            # Writes row to file
            writer.writerow(rowElementList)
            # Clears list
            rowElementList.clear()
            # Resets counter
            counter = 0
        else:
            # Increments counter
            counter += 1