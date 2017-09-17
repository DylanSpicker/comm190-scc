import os
import twitter
import json
from flask import Flask
from flask import render_template
from flask import jsonify
from watson_developer_cloud import PersonalityInsightsV3
from watson_developer_cloud import ToneAnalyzerV3
from watson_developer_cloud import NaturalLanguageClassifierV1

app = Flask(__name__)

port = int(os.getenv('PORT', 5000))

# Register Twitter API
api = twitter.Api(consumer_key='fe653UPMinFzN93aMlHbJ4a26',
                    consumer_secret='0QIZxnxEj57cb7uQ7wXWUSWtT4KNIwWqN59plji0wDi3rdXUuf',
                    access_token_key='137493607-HaNIdpZaJsQuS9J8biWP604KGvJm6bzrDIEXLMTb',
                    access_token_secret='OGOa6qkFfd8kBjsgadNsUkTi96BlolExZD9DrlwvrUtLF')

# Register Personality Insights
personality_insights = PersonalityInsightsV3(
                            version='2016-10-20',
                            username='d8bd36e6-629d-48c8-835f-0c8d070f1495',
                            password='2XHAUcgAbx1g')

# Register Tone Analyzer
tone_analyzer = ToneAnalyzerV3(
                    version='2016-05-19',
                    username='66a1a056-1cac-4924-af83-23db99514e9b',
                    password='oUprjwUXlT3T')

# Register NLC
nlc = NaturalLanguageClassifierV1(username="3a7e240e-b28e-46b0-aa6c-6a59310ea203",
                                  password="EG7xOCiiL8uq")
classifier_id = "359f41x201-nlc-198247"

# Home Route
@app.route('/')
def display_home():
    return render_template('index.html')

# Load Tweets
@app.route('/load-tweets')
def load_tweets():
    twitter_screen_name = "Keurig"
    statuses = []
    for status in api.GetSearch(term="@"+twitter_screen_name,include_entities=True):
        # Enrichments 
        classes = nlc.classify(classifier_id, status.text)
        tones = tone_analyzer.tone(status.text, tones='emotion')

        # Build Statuses List
        statuses.append({'text': status.text, 
                         'screen_name': status.user.screen_name, 
                         'profile_image': status.user.profile_image_url, 
                         'name': status.user.name,
                         'profile_url': "https://www.twitter.com/"+status.user.screen_name,
                         'classes': classes,
                         'tones': tones,
                         'tweet_id': status.id})
    return jsonify({'tweets': statuses})

# Load Twitter Profile
@app.route('/twitter-profile/<screen_name>')
def twitter_profile(screen_name = None):
    if screen_name is None:
        return jsonify({}), 500
    
        # Grab Statuses from Twitter API, based on screen_name
    statuses = api.GetUserTimeline(screen_name=screen_name, count=200)
    
    # If there are no Tweets, return an error
    if len(statuses) == 0:
        return json.dumps({'error': 'No Tweets were returned for that screen_name'})

    # Build out 'content_item' objects for each Tweet in the list
    content_items_list = []
    utterances_item_list = []

    # For every Tweet that was returned, build out the 'content_item' object;
    #   This is fully documented in the Bluemix documentation
    for status in statuses:
        content_item = {
            "language": "en",
            "id": status.id, 
            "content": status.text,
            "contenttype": "text/plain"
        }

        # Add the content item to the list
        content_items_list.append(content_item)
        
        # Add the first 50 to the 'utterances_item_list'
        if (len(utterances_item_list) < 50):
            utterance = {
                "text": status.text,
                "user": screen_name
            }
            utterances_item_list.append(utterance)

    # Retrieve the Personality Profile from Watson
    profile = personality_insights.profile(
            json.dumps({"contentItems": content_items_list}),
            content_type='application/json',
            raw_scores=False,
            consumption_preferences=True)

    # Retrieve the Tone Analyzer items from Watson
    tones = tone_analyzer.tone_chat(utterances_item_list)

    # Combine the 'tones' and the 'profile' variables into a single object
    profile['tones'] = tones

    # Return the combined data, as a JSON object
    return jsonify(profile)

# Start App
if __name__ == "__main__":
    app.run('0.0.0.0', port=port, debug=True)