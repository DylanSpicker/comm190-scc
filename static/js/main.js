$loader = $('<div class="loader" />');

// Define a function to return a random, appropriate response
// based on the class.
function getAutomatedResponse(top_class) {
    if (top_class == 'Satisfied') {
        var possible_responses = [
            "We are glad you like the product! Please let us know if there is anything we can improve!!",
            "Thanks for choosing Keurig - we are so happy that you are happy!",
            "Your support means the 🌎 to us!! Thank you so much!"
        ];
    } else if (top_class == 'Product Complaint') {
        var possible_responses = [
            "We are sorry you are having problems with your machine. We will get in contact to resolve this right away!",
            "We are sad to hear that your Keurig is not meeting expectations; we will make this right.",
            "Our apologies. You should not have to deal with a defective unit - we will be in touch shortly with a swift resolution!"
        ];
    } else if (top_class == 'Process Complaint') {
        var possible_responses = [
            "Sorry that the ordering process was not as smooth as it could have been. We will reach out to discuss this further!",
            "We are sorry that our process was not great. We are working on a way to make this right!",
            "Our apologies. You should not have to deal with a defective process - we will be in touch shortly with a swift resolution!"
        ];
    } else if (top_class = "Overjoyed") {
        var possible_responses = [
            "Thanks for the support! We are glad that you're happy!! 💖💖 Let us know how we can make this even better.",
            "We are so happy that you're happy! Thanks for being apart of the Keurig family!",
            "We are glad you love the product as much as we do - enjoy your ☕!!"
        ];
    } else if (top_class = 'Ambivalent') {
        var possible_responses = [
            "It seems as though we have some way to go to really 'wow!' you. Please reach out to us directly and we will make that happen!",
            "While we seemed to have impressed you a little, we want to push that even further! Get in touch and we will do what we can!",
            "Reach out to us so that we can change your feelings about #Keurig from 😐 to 😎!"
        ];
    } else {
        var possible_responses = [
            "We don't really know how to deal with this. Reach-out directly!",
            "We don't really know how to deal with this. Reach-out directly!",
            "We don't really know how to deal with this. Reach-out directly!"
        ];
    }

    return possible_responses[Math.floor(Math.random()*3)];
}

// Define a function which converts the class name to the correct
// corresponding image
function idToImageName(top_class) {
    if (top_class == 'joy') {
        var class_name = 'Satisfied';
    } else if (top_class == 'disgust') {
        var class_name = 'Very-Dissatisfied';
    } else if (top_class == 'sadness') {
        var class_name = 'Dissatisfied';
    } else if (top_class == "anger") {
        var class_name = 'Very-Dissatisfied';
    } else if (top_class == 'fear') {
        var class_name = 'Neutral';
    } else {
        var class_name = 'no';
    }

    return class_name;
}

// Function to Parse Tweet List and Add Components
function parseTweetList(tweet_list) {
    var class_counts = {
        'Satisfied': 0,
        'Overjoyed': 0,
        'Product Complaint': 0,
        'Process Complaint': 0,
        'Ambivalent': 0,
        'Gibberish': 0
    };
    var emotion_counts = {
        'joy': 0,
        'disgust': 0,
        'sadness': 0,
        'anger': 0,
        'fear': 0,
        'none': 0
    };
    var watson_action = {
        'Auto Replied': 0,
        'Pending Review': 0,
        'No Confident Reply': 0
    }
    tweet_list.forEach(function(tweet){
        // Count Classes
        var max_val = 0,
            max_name = "",
            max_id = "none";

        tweet['tones']['document_tone']['tone_categories'][0]['tones'].forEach(function(t){
            if (t['score'] > max_val){
                max_val = t['score'];
                max_name = t['tone_name'];
                max_id = t['tone_id'];
            }
        });
        class_counts[tweet['classes']['top_class']] += 1;
        emotion_counts[max_id] += 1;
        
        $row = $('<div class="row no-gutter border border-secondary border-top-0 border-left-0 border-right-0" />');
        $tweet_div = $('<div data-tweet_id="'+tweet['tweet_id']+'" data-user="'+tweet['screen_name']+'" class="tweet_holder row col-6 bg-white p-0 pt-5 pb-5 m-0 no-gutter" />');
        
        $profile_holder = $('<div class="p-2 m-0 col-2" />');
        $profile_image = $('<img class="profile" src="'+tweet['profile_image']+'" alt="Image" />');
        $profile_holder.append($profile_image);

        $tweet_content_div = $('<div class="p-0 m-0 col-8" />');
        $username = $('<p>'+tweet['name']+' <a href="'+tweet['profile_url']+'" target="_BLANK">@'+tweet['screen_name']+'</a></p>');
        $tweet_text = $('<p>'+tweet['text']+'</p>');
        $tweet_content_div.append($username);
        $tweet_content_div.append($tweet_text);
        
        $emoticon_div = $('<div class="p-0 m-0 col-2 text-center pt-4" />');

        image_name = idToImageName(max_id);

        $emoticon_div.append('<img class="emotion" src="static/images/'+image_name+'.svg" alt="'+image_name+'" />');

        $watson_response_div = $('<div class="row col-6 text-ligh bg-light-blue p-0 pt-5 pb-5 m-0 no-gutter">');
        
        $watson_avatar_div = $('<div class="p-2 m-0 col-2">');
        $watson_avatar = $('<img class="profile" src="static/images/watson-avatar-black.png" alt="Image" />');
        $watson_avatar_div.append($watson_avatar)

        $watson_response_text_container = $('<div class="p-0 pr-3 m-0 col-10" />');
        $watson_response_text = $('<p class="text-info">WatsonSupport - Automated Reply</p>');
        $watson_response_text_content = $('<p>'+getAutomatedResponse(tweet['classes']['top_class'])+'</p>');
        
        var second_badge;
        var percent = parseInt((tweet['classes']['classes'][0]['confidence']*100),10);
        if (percent >= 75) {
            second_badge = '<span class="badge badge-success">Auto Replied ('+percent+'%)</span>';
            watson_action['Auto Replied'] += 1;
        } else if (percent >= 50) {
            second_badge = '<span class="badge badge-warning">Pending Review ('+percent+'%)</span>';
            watson_action['Pending Review'] += 1;
        } else {
            second_badge = '<span class="badge badge-danger">No Confident Reply ('+percent+'%)</span>';
            watson_action['No Confident Reply'] += 1;
        }

        $watson_category_response = $('<p><span class="badge badge-dark">'+tweet['classes']['top_class']+'</span> '+second_badge+'</p>');
        
        $watson_response_text_container.append($watson_response_text);
        $watson_response_text_container.append($watson_response_text_content);
        $watson_response_text_container.append($watson_category_response);

        // Put it all together
        $tweet_div.append($profile_holder);
        $tweet_div.append($tweet_content_div);
        $tweet_div.append($emoticon_div);
        $watson_response_div.append($watson_avatar_div);
        $watson_response_div.append($watson_response_text_container);

        $row.append($tweet_div);
        $row.append($watson_response_div);

        $("#content_container").append($row);
    });

    for (var key in class_counts) {
        $("#class_counts").append('<li class="class_list pl-3">'+key+' <span class="badge badge-pill badge-light">'+class_counts[key]+'</span></li>');
    }
    for (var key in emotion_counts) {
        $("#emotion_counts").append('<li class="class_list pl-3"><img class="emotion" src="static/images/'+idToImageName(key)+'.svg" alt="'+idToImageName(key)+'" /> ('+key +') <span class="badge badge-pill badge-light">'+emotion_counts[key]+'</span></li>');
    }
    for (var key in watson_action) {
        var badge = '<span class="title badge badge-success">Auto Replied</span>';
        if (key == 'Pending Review') {
            badge = '<span class="title badge badge-warning">Pending Review</span>';
        } else if (key == 'No Confident Reply') {
            badge = '<span class="title badge badge-danger">No Confident Reply</span>';
        }
        $("#action_counts").append('<li class="class_list pl-3">'+badge+' <span class="badge badge-pill badge-light">'+watson_action[key]+'</span></li>');
    }
}

$(document).ready(function(){    
    // Load the Latest 20 @ Mentions
    $.ajax({
        url: 'load-tweets',
        method: 'GET',
        beforeSend: function(){
            $("#loader_covering").fadeIn();
        },
        success: function(response){
            $("#loader_covering").fadeOut();
            if ("tweets" in response) parseTweetList(response['tweets']);
        }
    });

    $('body').on('click', '.tweet_holder', function(){
        $('.tweet_holder').removeClass('active');
        $(this).addClass('active');
        $("#personality .container").html("");
        $("#personality").css("width", $('.tweet_holder').width()+"px");
        $("#personality").fadeIn();
        $.ajax({
            url: 'twitter-profile/'+$(this).data("user"),
            beforeSend: function(){
                $("#personality .container").append($loader);
            },
            success: function(profile){
                $("#personality .container").html("");
                $("#personality .container").append("<h4>@"+$('.tweet_holder.active').data('user')+"</h4>");
                profile["personality"].forEach(function(personality){
                    var personality_string = "<div class='personality pb-3' title='"+personality['name']+"' >";
                    
                    personality_string += "<span class='personality_label'>"+personality['name']+"</span>";
                    personality_string += "<div class='progress'><div class='progress-bar progress-bar-info' role='progressbar' style='width:"+personality['percentile']*100+"%'>"+parseFloat(personality['percentile']*100).toFixed(1)+"%</div></div>";
                    personality_string += "</div>";
                    $("#personality .container").append(personality_string);
                });
            }
        });
    });

    $("body").on('click', '.personality_close', function(){
        $("#personality").fadeOut();
        $("#personality .container").html("");
    });

});

