from selenium import webdriver

d = webdriver.Chrome()
d.get('https://www.worldometers.info/coronavirus/')
table = d.find_element_by_css_selector('[rel="table3"]')